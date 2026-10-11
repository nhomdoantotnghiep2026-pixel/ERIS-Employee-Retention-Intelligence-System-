import { AppShell } from '../components/AppShell';
import { Card, SectionHeader, AIAdvisoryBanner } from '../components/ui';
import { confusionMatrix, rocData, featureImportance } from '../data/mockData';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function ModelEvaluation() {
  const { tp, fp, fn, tn } = confusionMatrix;
  const total = tp + fp + fn + tn;

  return (
    <AppShell breadcrumb={['AI Model', 'Evaluation']}>
      <SectionHeader title="Model Evaluation" description="Performance metrics and analysis quality review — Attrition Model v2.3." />

      {/* Compact metrics strip */}
      <Card className="mb-4">
        <div className="grid grid-cols-5 divide-x divide-gray-200">
          {[
            { label: 'Accuracy', value: '87.2%' },
            { label: 'Precision', value: '85.3%' },
            { label: 'Recall', value: '83.2%' },
            { label: 'F1 Score', value: '84.1%' },
            { label: 'ROC-AUC', value: '0.921' },
          ].map(m => (
            <div key={m.label} className="px-5 py-3.5 text-center">
              <div className="text-[12px] text-gray-500 mb-0.5">{m.label}</div>
              <div className="text-[22px] font-bold text-[#2563EB] leading-none">{m.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Confusion Matrix */}
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">Confusion Matrix</div>
          <div className="text-[12px] text-gray-400 mb-3">Validation dataset · n={total}</div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <div className="grid grid-cols-3 gap-0 text-[12px] text-center">
                <div className="p-2" />
                <div className="p-2 font-medium text-gray-500">Predicted: No</div>
                <div className="p-2 font-medium text-gray-500">Predicted: Yes</div>
                <div className="p-2 font-medium text-gray-500 flex items-center justify-end text-[11px]">Actual: No</div>
                <div className="p-3 bg-green-50 border border-green-200" style={{ borderRadius: '4px 0 0 4px' }}>
                  <div className="text-[20px] font-bold text-green-600">{tn}</div>
                  <div className="text-gray-400 text-[11px]">True Neg.</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200" style={{ borderRadius: '0 4px 4px 0' }}>
                  <div className="text-[20px] font-bold text-red-500">{fp}</div>
                  <div className="text-gray-400 text-[11px]">False Pos.</div>
                </div>
                <div className="p-2 font-medium text-gray-500 flex items-center justify-end text-[11px]">Actual: Yes</div>
                <div className="p-3 bg-amber-50 border border-amber-200" style={{ borderRadius: '4px 0 0 4px' }}>
                  <div className="text-[20px] font-bold text-amber-500">{fn}</div>
                  <div className="text-gray-400 text-[11px]">False Neg.</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200" style={{ borderRadius: '0 4px 4px 0' }}>
                  <div className="text-[20px] font-bold text-green-600">{tp}</div>
                  <div className="text-gray-400 text-[11px]">True Pos.</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ROC Curve */}
        <Card className="p-4">
          <div className="text-[14px] font-medium text-gray-800 mb-0.5">ROC Curve</div>
          <div className="text-[12px] text-gray-400 mb-3">AUC = 0.921 · Dashed: random classifier</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ right: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" />
                <XAxis dataKey="fpr" tickFormatter={v => `${Math.round(v * 100)}%`} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tickFormatter={v => `${Math.round(v * 100)}%`} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip formatter={(v: any) => [`${(Number(v) * 100).toFixed(0)}%`]} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#E5E7EB" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="tpr" stroke="#2563EB" strokeWidth={2} dot={false} name="True Positive Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Feature Importance */}
      <Card className="p-4 mb-4">
        <div className="text-[14px] font-medium text-gray-800 mb-0.5">Feature Importance</div>
        <div className="text-[12px] text-gray-400 mb-3">Relative importance of each feature in model predictions</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImportance} layout="vertical" margin={{ left: 120, right: 24 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: '#4B5563' }} width={114} />
              <Tooltip formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, 'Importance']} />
              <Bar dataKey="importance" fill="#2563EB" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Explainability Review */}
      <Card className="p-4 mb-4">
        <div className="text-[14px] font-medium text-gray-800 mb-3">Explainability Review</div>
        <div className="flex items-center gap-3 mb-3">
          {['Explanations Available', 'Generated Successfully', 'Ready for HR Display'].map(s => (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200" style={{ borderRadius: '5px' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[13px] text-green-700 font-medium">{s}</span>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-gray-400 leading-relaxed">
          Prediction quality and explanation usefulness are evaluated before operational display. These metrics provide guidance for HR review but do not guarantee correctness for individual cases. Predictions should always be reviewed alongside other available information.
        </p>
      </Card>

      <AIAdvisoryBanner />
    </AppShell>
  );
}
