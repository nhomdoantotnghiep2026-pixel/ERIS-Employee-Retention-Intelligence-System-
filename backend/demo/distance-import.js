(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  $('scriptStatus').hidden = true;
  let token = null, csv = null, displayRows = [], polling = null, active = false;
  const messages = {
    INCOMPLETE_ADDRESS: 'Thiếu hoặc quá dài số nhà, đường, phường/xã hoặc tỉnh/thành.',
    MISSING_OR_DUPLICATE_EMPLOYEE_ID: 'Thiếu hoặc trùng mã nhân viên.',
    AMBIGUOUS_ADDRESS: 'Có nhiều địa chỉ khớp; cần xác nhận.',
    ADDRESS_NOT_MATCHED: 'Chưa tìm thấy địa chỉ khớp đầy đủ.',
    PLACE_DETAILS_MISMATCH: 'Chi tiết địa chỉ trả về không khớp đầu vào.',
    ROUTING_RATE_LIMITED: 'Nhà cung cấp đã chạm giới hạn lượt gọi.',
    ROUTING_CONFIGURATION_ERROR: 'Kiểm tra API key và giới hạn truy cập.',
    GEOCODING_NOT_CONFIGURED: 'Chưa cấu hình API key Vietmap.',
    ROUTING_NOT_CONFIGURED: 'Chưa cấu hình API key TomTom.',
    ROUTE_NOT_FOUND: 'Không tìm được tuyến đường ô tô.',
    ROUTING_TIMEOUT: 'Nhà cung cấp phản hồi quá thời gian.',
  };
  const message = text => { $('message').textContent = text; };
  async function api(path, options = {}, blob = false) {
    const send = () => fetch(path, { ...options, headers: { 'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    let response = await send();
    if (response.status === 401 && token) {
      const renewed = await fetch('/api/auth/refresh', { method: 'POST' });
      if (renewed.ok) { token = (await renewed.json()).accessToken; response = await send(); }
    }
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error?.message || `HTTP ${response.status}`);
    }
    return blob ? response.blob() : response.json();
  }
  const cell = text => { const td = document.createElement('td'); td.textContent = text; return td; };
  function render() {
    const fragment = document.createDocumentFragment();
    const selected = $('filter').value;
    for (const row of displayRows.filter(row => selected === 'ALL' || row.status === selected)) {
      const tr = document.createElement('tr');
      tr.append(cell(row.employeeId), cell([row.houseNumber, row.street, row.ward, row.district, row.city]
        .filter(Boolean).join(', ')), cell(row.normalizedAddress || '—'),
      cell(row.latitude !== '' && row.latitude !== undefined ? `${row.latitude}, ${row.longitude}` : '—'),
      cell(typeof row.distanceFromHomeKm === 'number' ? `${row.distanceFromHomeKm} km` : '—'));
      const status = cell(''); const badge = document.createElement('span');
      badge.className = `badge ${row.status === 'READY' ? 'ready' : row.status === 'REVIEW' ? 'review' : ''}`;
      badge.textContent = row.status || 'CHƯA XỬ LÝ'; status.append(badge);
      if (row.reason) { const reason = document.createElement('small'); reason.textContent = messages[row.reason] || row.reason; status.append(reason); }
      tr.append(status); fragment.append(tr);
    }
    $('rows').replaceChildren(fragment);
  }
  function setActive(value) {
    active = value; $('file').disabled = value; $('logout').disabled = value;
    $('start').disabled = value || (!csv && $('start').textContent !== 'Theo dõi lại');
  }
  async function poll(id) {
    try {
      const job = await api(`/api/v1/distance/imports/${id}`);
      displayRows = job.rows; render();
      $('progress').value = 100 * job.processed / job.total;
      $('progressText').textContent = `${job.status === 'RUNNING' ? 'Đang xử lý' : job.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Xử lý bị gián đoạn'}: ${job.processed}/${job.total} nhân viên`;
      $('counts').textContent = `${job.ready} READY · ${job.review} REVIEW`;
      if (job.status === 'RUNNING') polling = setTimeout(() => poll(id), 2000);
      else {
        setActive(false); $('download').disabled = job.status !== 'COMPLETED';
        message(job.error || 'Đã xử lý xong. Lọc REVIEW để xem các địa chỉ cần kiểm tra.');
      }
    } catch (error) {
      $('start').textContent = 'Theo dõi lại';
      setActive(false); message(`${error.message}. Bấm “Theo dõi lại” để thử kết nối lại.`);
    }
  }
  $('loginForm').addEventListener('submit', async event => {
    event.preventDefault(); $('loginButton').disabled = true;
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value }) });
      if (result.requiresPasswordChange || !result.accessToken) throw new Error('Tài khoản cần đổi mật khẩu lần đầu. Hãy kích hoạt tài khoản trước khi dùng bản thử import.');
      token = result.accessToken;
      await api('/api/v1/distance/imports/preview', { method: 'POST', body: JSON.stringify({ csv: 'employeeId,houseNumber,street,ward,district,city\nCHECK,1,Test,Test,,Test\n' }) });
      $('password').value = ''; $('loginPanel').hidden = true; $('workspace').hidden = false; message('Đã đăng nhập. Chọn CSV để xem trước.');
      const id = sessionStorage.getItem('distanceImportJob');
      if (id) { $('resultsPanel').hidden = false; setActive(true); await poll(id); }
    } catch (error) { token = null; message(error.message); }
    finally { $('loginButton').disabled = false; }
  });
  $('logout').addEventListener('click', () => {
    clearTimeout(polling); token = null; csv = null; displayRows = [];
    sessionStorage.removeItem('distanceImportJob'); $('workspace').hidden = true; $('loginPanel').hidden = false;
    $('file').value = ''; $('resultsPanel').hidden = true; message('Đăng nhập tài khoản khác để tiếp tục.');
  });
  $('file').addEventListener('change', async () => {
    csv = null; $('start').disabled = true; $('download').disabled = true;
    sessionStorage.removeItem('distanceImportJob'); $('start').textContent = 'Xử lý địa chỉ';
    $('previewSummary').textContent = ''; $('issues').replaceChildren(); $('resultsPanel').hidden = true;
    const file = $('file').files[0]; if (!file) return;
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Hãy lưu file Excel thành CSV UTF-8 (.csv) trước khi tải lên.');
      if (file.size > 200_000) throw new Error('File vượt giới hạn 200 KB.');
      const content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
      const preview = await api('/api/v1/distance/imports/preview', { method: 'POST', body: JSON.stringify({ csv: content }) });
      csv = content; displayRows = preview.rows; render();
      $('resultsPanel').hidden = false; $('resultTitle').textContent = 'Xem trước dữ liệu';
      $('previewSummary').textContent = `${preview.total} nhân viên · ${preview.issues.length} dòng có lỗi đầu vào.`;
      for (const issue of preview.issues) {
        const li = document.createElement('li'); li.textContent = `Dòng ${issue.row} (${issue.employeeId || 'chưa có mã'}): ${issue.reasons.map(reason => messages[reason]).join(' ')}`; $('issues').append(li);
      }
      $('progress').value = 0; $('progressText').textContent = 'Chưa gọi dịch vụ bản đồ.'; $('counts').textContent = '';
      $('start').disabled = false; message('Kiểm tra dữ liệu xem trước rồi bấm “Xử lý địa chỉ”.');
    } catch (error) { message(error.message); }
  });
  $('start').addEventListener('click', async () => {
    if (active) return;
    setActive(true); $('download').disabled = true;
    try {
      let id = sessionStorage.getItem('distanceImportJob');
      if ($('start').textContent !== 'Theo dõi lại') {
        const job = await api('/api/v1/distance/imports', { method: 'POST', body: JSON.stringify({ csv }) });
        id = job.id; sessionStorage.setItem('distanceImportJob', id);
      }
      $('resultTitle').textContent = 'Kết quả xử lý địa chỉ'; message('Đang xử lý. Bạn có thể theo dõi tiến độ bên dưới.');
      await poll(id);
    } catch (error) { setActive(false); message(error.message); }
  });
  $('filter').addEventListener('change', render);
  $('download').addEventListener('click', async () => {
    try {
      const id = sessionStorage.getItem('distanceImportJob');
      const data = await api(`/api/v1/distance/imports/${id}/download`, {}, true);
      const url = URL.createObjectURL(data), link = document.createElement('a');
      link.href = url; link.download = `employees-distance-${id}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { message(error.message); }
  });
})();
