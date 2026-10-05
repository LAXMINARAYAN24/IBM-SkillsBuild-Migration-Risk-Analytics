# U.S. Interstate Migration Classification

This project analyzes CPS records from 2010–2019 to classify whether an adult reported an interstate move in the prior year. The React dashboard presents calibrated estimates and observed rates for a held-out 2018–2019 period.

## Verified result

The current reproducible pipeline selected a histogram gradient-boosting model using 2016–2017 validation data. It achieved **ROC-AUC 0.6994** and **average precision 0.0475** on 264,173 unweighted 2018–2019 holdout records. The observed interstate-move rate was 1.49%; therefore accuracy alone is not a useful measure of model quality.

The complete metrics, split definitions, model candidates, calibration results, and version information are stored in [data/evaluation_report.json](data/evaluation_report.json). The dashboard reads the same data from `frontend/public/data/`.

## What changed in the audited pipeline

- `MIGRATE1 = 5` means moved between states. Values 1, 3, and 4 are non-interstate moves. The prior pipeline incorrectly treated value 4 as an interstate move.
- State-level aggregates that contain the outcome are no longer model features.
- ASEC survey weights are used for fitting and state-level summaries. Primary discrimination metrics remain unweighted and a weighted check is reported separately.
- Earlier records belonging to people observed in later partitions are removed before evaluation.
- Model family and classification threshold are selected on 2016–2017 data; 2018–2019 labels are not used until final testing.

The model is retrospective: it estimates a past-year interstate-move indicator for a respondent. It is not a forecast of future state outflow, net migration, or an explanation of a person’s reason for moving.

## Run

```powershell
pip install -r requirements.txt
python migration_pipeline.py
cd frontend
npm install
npm run dev
```

`LaxminarayanSahu_MigrationRiskAnalysis.py` is retained as a compatibility entry point and runs the audited pipeline. The root notebook contains the complete audited analytical code and reference results.

## Internship submission

The `submission/` directory contains the four required files: the complete notebook, `requirements.txt`, the Word project report, and a submission-specific `README.md` with dataset access and execution instructions. Upload these four files for the internship submission.

## Git contents

The repository includes source code, tests, documentation, submission files, small Census tables, and dashboard summaries. The raw CPS extract, local training model, scratch folders, generated results, dependencies, build outputs, local environment files, and downloaded duplicates are ignored. Obtain the raw extract using the dataset instructions before rerunning the analysis.

## Data and outputs

- `data/cps_00001.csv`: IPUMS CPS microdata (not committed because it exceeds hosting limits).
- `data/evaluation_report.json`: full audit output.
- `data/eda_summary.json`: compact dashboard summary.
- `data/state_risk_scores.csv`: survey-weighted state summaries for the holdout.
- `data/migration_model.joblib`: fitted model and threshold.
- `data/model_evaluation.png`: ROC, precision–recall, and calibration plots.

## Sources

- [IPUMS CPS: MIGRATE1 definition](https://cps.ipums.org/cps-action/variables/MIGRATE1)
- [U.S. Census state-to-state migration tables](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html)
