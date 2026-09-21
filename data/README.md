# Data Directory

This directory contains the datasets used by the Migration Risk Intelligence Platform.

## Datasets

### 1. IPUMS CPS Microdata (`cps_00001.csv`)
- **Source:** [IPUMS CPS](https://cps.ipums.org/cps/)
- **Description:** Current Population Survey (CPS) Annual Social and Economic Supplement (ASEC) microdata
- **Years:** 2010–2019
- **Variables:** YEAR, STATEFIP, AGE, SEX, RACE, EDUC, EMPSTAT, INCTOT, MIGRATE1
- **Size:** ~848 MB (~8.28 million individual records)
- **How to obtain:**
  1. Create a free account at [cps.ipums.org](https://cps.ipums.org/cps/)
  2. Click "Get Data" → Select Samples → Check years 2010–2019
  3. Add variables: YEAR, SERIAL, MONTH, STATEFIP, AGE, SEX, RACE, EDUC, EMPSTAT, INCTOT, MIGRATE1
  4. Submit extract → Download as CSV

### 2. Census State-to-State Migration Tables (`*_migrations_table_*.xls`)
- **Source:** [U.S. Census Bureau](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html)
- **Description:** ACS 1-year estimates of state-to-state migration flows
- **Years:** 2010–2019 (10 Excel files)
- **Format:** XLS with multi-header layout
- **How to obtain:** Direct download from Census Bureau website (no registration required)

## Generated Outputs
After running the notebook, the following files are generated in this directory:
- `state_risk_scores.csv` — State-level migration risk scores
- `individual_predictions.csv` — Sample of individual-level risk predictions
- `eda_summary.json` — Summary statistics for dashboard
- `*.png` — EDA and model evaluation chart images
