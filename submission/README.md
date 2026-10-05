# U.S. Interstate Migration Analysis

Author: Laxminarayan Sahu  
IBM SkillsBuild Data Analytics with AI Academic Internship Program  
Conducted by BharatCares in association with AICTE

## Description
This project uses IPUMS CPS ASEC records from 2010–2019 to classify whether an adult moved between U.S. states in the previous year. It includes cleaning, feature engineering, temporal validation, logistic regression and gradient-boosting comparisons, evaluation charts, and weighted state summaries. The supplied notebook contains the complete analytical code without requiring another project module.

## Dataset
[IPUMS CPS](https://cps.ipums.org/) provides the microdata. Register and request an extract containing YEAR, ASECFLAG, STATEFIP, AGE, SEX, RACE, EDUC, INCTOT, MIGRATE1, ASECWT, and CPSIDP for 2010–2019. Save the CSV as `data/cps_00001.csv` beside the notebook. Access is subject to IPUMS terms; the original raw file is not included in this four-file submission.

[MIGRATE1 documentation](https://cps.ipums.org/cps-action/variables/MIGRATE1) defines code 5 as interstate migration. [Census migration tables](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html) provide historical context; they are not predictors in this corrected model.

## Technologies and setup
Python 3.10 or newer, Jupyter, pandas, NumPy, scikit-learn, Matplotlib, joblib, and threadpoolctl. The reference run used Python 3.12.7, pandas 3.0.2, and scikit-learn 1.9.0.

```sh
python -m pip install -r requirements.txt
python -m jupyter notebook LaxminarayanSahu_MigrationRiskAnalysis.ipynb
```

Choose Restart Kernel and Run All Cells. The notebook finds `data/cps_00001.csv` in its working folder or a parent folder and writes CSV summaries, JSON metrics, model diagnostics, and a saved model to `results/`. The original 849 MB extract is processed in chunks; several GB of free memory are recommended for combined modeling data.

## Results
Train: 2010–2015; validate: 2016–2017; test: 2018–2019. Repeated respondents are purged from earlier partitions. The selected gradient-boosting model achieved ROC-AUC 0.6994 and average precision 0.04748 on 264,173 holdout records, versus 0.6960 and 0.03919 for logistic regression. The observed positive rate is 1.49%. At the validation-selected threshold, precision is 6.47% and recall is 16.72%.

The model classifies past-year moves among current residents. Its results do not support claims about future outflow or causal effects. Probability reliability is assessed in a diagnostic chart; no separate calibration estimator is fitted.

## Four submission files
- `LaxminarayanSahu_MigrationRiskAnalysis.ipynb` — complete notebook and reference results
- `requirements.txt` — Python dependencies
- `LaxminarayanSahu_ProjectReport.docx` — methodology, results, limitations, and reproducibility instructions
- `README.md` — project overview and dataset/setup information
