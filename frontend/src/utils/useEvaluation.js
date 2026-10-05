import { useEffect, useState } from 'react';
import { loadJSON } from './dataUtils';

export default function useEvaluation() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadJSON('/data/evaluation_report.json')
      .then(value => { if (active) setReport(value); })
      .catch(() => { if (active) setError('Evaluation could not be loaded. Run the Python pipeline and refresh.'); });
    return () => { active = false; };
  }, []);
  return { report, error };
}
