import { Download, FileText, Printer } from 'lucide-react';
import useEvaluation from '../utils/useEvaluation';

const percent = (value, digits = 2) => value == null ? '—' : `${(value * 100).toFixed(digits)}%`;

export default function Reports() {
  const { report, error } = useEvaluation();
  const test = report?.test;
  const weighted = report?.test_survey_weighted;
  const downloadReport = () => {
    if (!report) return;
    const text = [
      '# Migration Analysis Evaluation Report', '', `Selected model: ${report.selected_model}`,
      `Target: ${report.target}`, `Interpretation: ${report.interpretation}`, '',
      '## 2018–2019 Holdout (unweighted)', `- ROC-AUC: ${test.roc_auc.toFixed(4)}`,
      `- Average precision: ${percent(test.average_precision)}`,
      `- Precision at validation-selected threshold: ${percent(test.precision)}`,
      `- Recall at validation-selected threshold: ${percent(test.recall)}`,
      `- Brier score: ${test.brier.toFixed(4)}`, `- Threshold: ${percent(report.decision_threshold)}`, '',
      'The full machine-readable evidence is evaluation_report.json.'
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'migration_evaluation_report.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5"><FileText className="w-6 h-6 text-indigo-400" /> Evaluation report</h1>
          <p className="text-xs text-gray-400 mt-1">Reproducible, temporally separated assessment of past-year interstate moves.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"><Printer size={14} /> Print</button>
          <button onClick={downloadReport} disabled={!report} className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"><Download size={14} /> Download</button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {!report ? <p className="text-sm text-gray-400">Loading evaluation evidence…</p> : <div className="admin-card p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Verified model output</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">U.S. interstate migration classification</h2>
          <p className="text-xs leading-relaxed text-gray-300">{report.interpretation} The outcome is CPS <code>MIGRATE1 = 5</code>; within-state moves are negative examples. Model and threshold selection used 2016–2017 only; the 2018–2019 test labels were held back until final assessment.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            ['ROC-AUC', test.roc_auc.toFixed(4), '2018–2019 holdout'],
            ['Average precision', percent(test.average_precision), `Prevalence ${percent(test.observed_rate)}`],
            ['Precision', percent(test.precision), `Threshold ${percent(report.decision_threshold)}`],
            ['Brier score', test.brier.toFixed(4), 'Lower is better']
          ].map(([label, value, note]) => <div key={label} className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}><span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span><p className="text-xl font-black text-emerald-400 mt-1 font-mono">{value}</p><span className="text-[10px] text-gray-500">{note}</span></div>)}
        </div>
        <div className="grid sm:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-bold text-white mb-2">Holdout sample</h3><p className="text-gray-300">{report.splits.test.rows.toLocaleString()} records across {report.splits.test.years.join(' and ')}. {report.purged_earlier_records.toLocaleString()} earlier observations were removed to avoid the same person appearing in different temporal splits.</p></div>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-bold text-white mb-2">Survey-weighted check</h3><p className="text-gray-300">Weighted ROC-AUC: {weighted.roc_auc.toFixed(4)}; weighted observed rate: {percent(weighted.observed_rate)}. State aggregates use CPS ASEC weights.</p></div>
        </div>
        <p className="text-xs text-gray-500">This is a retrospective classification model. It does not estimate future net migration, causes of migration, or individual outcomes for policy decisions.</p>
      </div>}
    </div>
  );
}
