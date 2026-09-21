# =============================================================================
# U.S. POPULATION MIGRATION RISK INTELLIGENCE PLATFORM
# Complete Python Source Code (.py export)
#
# Author:       Laxminarayan Sahu
# Program:      IBM SkillsBuild Data Analytics with AI Academic Internship
#               Program (BharatCares in association with AICTE)
# Project:      Migration Risk Intelligence — Predictive Analytics for
#               State-Level Migration Risk Assessment
# Datasets:     U.S. Census Bureau State-to-State Migration (2010-2019)
#               IPUMS CPS Annual Social & Economic Supplement Microdata
# Python:       3.11+
# License:      Academic / Educational Use
#
# Description:  This script implements an end-to-end machine-learning pipeline
#               that (1) ingests and cleans macro-level Census migration flow
#               matrices and individual-level IPUMS CPS survey records,
#               (2) engineers a novel Migration Pressure Index (MPI) feature,
#               (3) trains a regularized Logistic Regression classifier to
#               predict individual interstate relocation probability, and
#               (4) produces publication-quality EDA visualizations and a
#               comprehensive model evaluation scorecard.
#
# Usage:        python LaxminarayanSahu_MigrationRiskAnalysis.py
# =============================================================================


# [Section Comment]:
# # 🇺🇸 U.S. Population Migration Risk Intelligence Platform
# 
# ## Predictive Analytics for State-Level Migration Risk Assessment
# 
# **Problem Statement:** State and local governments lose billions in tax revenue due to population outflows, yet they lack predictive tools to identify at-risk demographic segments before mass exodus occurs. This project combines individual-level census microdata with state-level migration flows to predict which demographic groups are most likely to relocate, enabling proactive policy interventions.
# 
# ---
# 
# ### Datasets
# 
# | Dataset | Source | Link |
# |---------|--------|------|
# | **Individual Microdata** | IPUMS CPS (ASEC Supplement) | [cps.ipums.org](https://cps.ipums.org/cps/) |
# | **State Flow Aggregates** | U.S. Census Bureau ACS | [census.gov](https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html) |
# 
# ### Key Variables
# - **Target Variable:** `MIGRATE1` — Migration status (Moved interstate = 1, Stayed = 0)
# - **Features:** Age, Sex, Race, Education, Employment Status, Income, State Migration Pressure Index
# - **Model:** Logistic Regression (Binary Classification)
# - **Temporal Split:** Train on 2010–2017, Test on 2018–2019

# [Section Comment]:
# ## 1. Environment Setup & Library Imports

# -----------------------------------------------------
# Code Cell 3
# -----------------------------------------------------
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
import warnings
warnings.filterwarnings('ignore')

# Scikit-learn imports
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_curve, roc_auc_score, accuracy_score,
                             precision_score, recall_score, f1_score)

# Plot styling
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 12
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12

print("✅ All libraries loaded successfully!")

# [Section Comment]:
# ## 2. Data Loading
# 
# ### 2.1 IPUMS CPS Microdata
# Loading the Current Population Survey (CPS) Annual Social and Economic Supplement (ASEC) microdata. This contains individual-level demographic and migration records.

# -----------------------------------------------------
# Code Cell 5
# -----------------------------------------------------
# Load CPS Microdata (8.28M rows)
# We filter to relevant columns and years 2010-2019 during loading for memory efficiency
print("Loading CPS Microdata...")
cps_cols = ['YEAR', 'STATEFIP', 'AGE', 'SEX', 'RACE', 'EDUC', 'EMPSTAT',
            'INCTOT', 'MIGRATE1', 'ASECFLAG', 'ASECWT']

# Read in chunks for memory efficiency
chunks = []
for chunk in pd.read_csv('data/cps_00001.csv', chunksize=500000, usecols=lambda c: c in cps_cols):
    # Filter to years 2010-2019 and valid MIGRATE1 responses
    mask = (chunk['YEAR'].between(2010, 2019)) & (chunk['MIGRATE1'].notna()) & (chunk['MIGRATE1'] > 0)
    chunks.append(chunk[mask])

cps_raw = pd.concat(chunks, ignore_index=True)
print(f"✅ CPS Microdata loaded: {cps_raw.shape[0]:,} rows × {cps_raw.shape[1]} columns")
print(f"   Year range: {cps_raw['YEAR'].min()} – {cps_raw['YEAR'].max()}")
print(f"   Unique states (FIPS): {cps_raw['STATEFIP'].nunique()}")
print(f"\nFirst 5 rows:")
cps_raw.head()

# [Section Comment]:
# ### 2.2 Census State-to-State Migration Flows
# Loading and parsing the Census Bureau's ACS state-to-state migration tables (2010-2019). These Excel files have multi-header layouts requiring careful extraction.

# -----------------------------------------------------
# Code Cell 7
# -----------------------------------------------------
# Parse Census State-to-State Migration Excel Files
import glob
import os

def parse_state_flow_excel(filepath, year):
    """Parse a Census state-to-state migration Excel file.
    
    The files have a complex multi-header layout:
    - Row 0-4: Title/metadata
    - Row 5-7: Column headers
    - Row 9+: Data (with blank separator rows)
    
    We extract: State name, Total Population, Same House, Same State, Different State (inflow)
    """
    df = pd.read_excel(filepath, header=None)
    
    records = []
    for i in range(9, len(df)):
        state_name = df.iloc[i, 0]
        if pd.isna(state_name) or not isinstance(state_name, str):
            continue
        state_name = state_name.strip().rstrip('0123456789')  # Remove footnote numbers
        if state_name in ['', 'nan'] or 'United States' in state_name or 'Puerto Rico' in state_name:
            continue
        
        try:
            total_pop = pd.to_numeric(df.iloc[i, 1], errors='coerce')
            same_house = pd.to_numeric(df.iloc[i, 3], errors='coerce')
            same_state = pd.to_numeric(df.iloc[i, 5], errors='coerce')
            diff_state_inflow = pd.to_numeric(df.iloc[i, 7], errors='coerce')
            
            if pd.notna(total_pop) and total_pop > 0:
                records.append({
                    'STATE_NAME': state_name.strip(),
                    'YEAR': year,
                    'TOTAL_POP': int(total_pop),
                    'SAME_HOUSE': int(same_house) if pd.notna(same_house) else 0,
                    'SAME_STATE': int(same_state) if pd.notna(same_state) else 0,
                    'DIFF_STATE_INFLOW': int(diff_state_inflow) if pd.notna(diff_state_inflow) else 0
                })
        except (ValueError, TypeError):
            continue
    
    return pd.DataFrame(records)

# Process all 10 years
state_flow_dfs = []
data_dir = 'data'
for year in range(2010, 2020):
    # Handle mixed case filenames
    patterns = [
        f'state_to_state_migrations_table_{year}.xls',
        f'State_to_State_Migrations_Table_{year}.xls'
    ]
    for pattern in patterns:
        filepath = os.path.join(data_dir, pattern)
        if os.path.exists(filepath):
            df_year = parse_state_flow_excel(filepath, year)
            state_flow_dfs.append(df_year)
            print(f"  ✅ {year}: {len(df_year)} states parsed from {pattern}")
            break

state_flows = pd.concat(state_flow_dfs, ignore_index=True)

# Calculate derived columns
state_flows['MOVERS'] = state_flows['TOTAL_POP'] - state_flows['SAME_HOUSE']
state_flows['OUTFLOW'] = state_flows['MOVERS'] - state_flows['SAME_STATE'] - state_flows['DIFF_STATE_INFLOW']
# OUTFLOW can be approximated; using total movers minus inflow as proxy
state_flows['MOBILITY_RATE'] = state_flows['MOVERS'] / state_flows['TOTAL_POP']
state_flows['INTERSTATE_INFLOW_RATE'] = state_flows['DIFF_STATE_INFLOW'] / state_flows['TOTAL_POP']

print(f"\n✅ State Flows loaded: {state_flows.shape[0]:,} rows × {state_flows.shape[1]} columns")
print(f"   Years: {sorted(state_flows['YEAR'].unique())}")
print(f"   States: {state_flows['STATE_NAME'].nunique()}")
state_flows.head(10)

# [Section Comment]:
# ## 3. Data Cleaning & Preprocessing
# 
# ### 3.1 CPS Microdata Cleaning

# -----------------------------------------------------
# Code Cell 9
# -----------------------------------------------------
# STATEFIP to State Name mapping (Federal Information Processing Standards)
STATEFIP_MAP = {
    1: 'Alabama', 2: 'Alaska', 4: 'Arizona', 5: 'Arkansas', 6: 'California',
    8: 'Colorado', 9: 'Connecticut', 10: 'Delaware', 11: 'District of Columbia',
    12: 'Florida', 13: 'Georgia', 15: 'Hawaii', 16: 'Idaho', 17: 'Illinois',
    18: 'Indiana', 19: 'Iowa', 20: 'Kansas', 21: 'Kentucky', 22: 'Louisiana',
    23: 'Maine', 24: 'Maryland', 25: 'Massachusetts', 26: 'Michigan',
    27: 'Minnesota', 28: 'Mississippi', 29: 'Missouri', 30: 'Montana',
    31: 'Nebraska', 32: 'Nevada', 33: 'New Hampshire', 34: 'New Jersey',
    35: 'New Mexico', 36: 'New York', 37: 'North Carolina', 38: 'North Dakota',
    39: 'Ohio', 40: 'Oklahoma', 41: 'Oregon', 42: 'Pennsylvania',
    44: 'Rhode Island', 45: 'South Carolina', 46: 'South Dakota',
    47: 'Tennessee', 48: 'Texas', 49: 'Utah', 50: 'Vermont', 51: 'Virginia',
    53: 'Washington', 54: 'West Virginia', 55: 'Wisconsin', 56: 'Wyoming'
}

# MIGRATE1 codes (IPUMS CPS)
# 0 = NIU (Not in Universe), 1 = Same house, 3 = Different house same state,
# 4 = Different state same division, 5 = Different state different division, 6 = Abroad
MIGRATE1_MAP = {
    1: 'Same house',
    3: 'Different house, same state',
    4: 'Different state, same division',
    5: 'Different state, different division',
    6: 'Abroad'
}

# Education code grouping
def map_education(educ):
    if educ <= 2: return 'None/Preschool'
    elif educ <= 50: return 'Less than High School'
    elif educ <= 73: return 'High School/GED'
    elif educ <= 92: return 'Some College/Associate'
    elif educ <= 111: return "Bachelor's"
    else: return 'Graduate/Professional'

# Race code grouping
def map_race(race):
    if race == 100: return 'White'
    elif race == 200: return 'Black'
    elif race == 300: return 'American Indian'
    elif race >= 650 and race <= 652: return 'Asian/Pacific Islander'
    else: return 'Mixed/Other'

print("Cleaning CPS Microdata...")

# Create a working copy
cps = cps_raw.copy()

# Map state names
cps['STATE_NAME'] = cps['STATEFIP'].map(STATEFIP_MAP)

# Create binary migration target
# MIGRATED = 1 if moved to different state (codes 4, 5)
# MIGRATED = 0 if stayed (codes 1, 3 — same house or same state)
# Exclude code 6 (abroad) and 0 (NIU)
cps = cps[cps['MIGRATE1'].isin([1, 3, 4, 5])].copy()
cps['MIGRATED'] = (cps['MIGRATE1'].isin([4, 5])).astype(int)

# Map categorical variables
cps['EDUC_GROUP'] = cps['EDUC'].apply(map_education)
cps['RACE_GROUP'] = cps['RACE'].apply(map_race)
cps['SEX_LABEL'] = cps['SEX'].map({1: 'Male', 2: 'Female'})
cps['MIGRATE1_LABEL'] = cps['MIGRATE1'].map(MIGRATE1_MAP)

# Clean income — 999999999 means N/A (typically children)
cps['INCOME_CLEAN'] = cps['INCTOT'].replace(999999999, np.nan)

# Filter to adults (age >= 18) with valid income for modeling
cps_adults = cps[(cps['AGE'] >= 18) & (cps['INCOME_CLEAN'].notna())].copy()

# Drop rows without state mapping
cps_adults = cps_adults.dropna(subset=['STATE_NAME'])

print(f"✅ Cleaned CPS data: {cps_adults.shape[0]:,} adult records")
print(f"   Migration rate: {cps_adults['MIGRATED'].mean():.2%}")
print(f"   Migrants (interstate): {cps_adults['MIGRATED'].sum():,}")
print(f"   Non-migrants: {(cps_adults['MIGRATED'] == 0).sum():,}")

print(f"\nMigration Status Distribution:")
print(cps_adults['MIGRATE1_LABEL'].value_counts().to_string())

# [Section Comment]:
# ### 3.2 Create Age Cohorts & Income Brackets

# -----------------------------------------------------
# Code Cell 11
# -----------------------------------------------------
# Age cohorts
def age_cohort(age):
    if age < 25: return '18-24'
    elif age < 35: return '25-34'
    elif age < 45: return '35-44'
    elif age < 55: return '45-54'
    elif age < 65: return '55-64'
    else: return '65+'

cps_adults['AGE_COHORT'] = cps_adults['AGE'].apply(age_cohort)

# Income brackets
def income_bracket(income):
    if income < 0: return 'Negative/Loss'
    elif income < 25000: return 'Under $25K'
    elif income < 50000: return '$25K-$50K'
    elif income < 75000: return '$50K-$75K'
    elif income < 100000: return '$75K-$100K'
    else: return '$100K+'

cps_adults['INCOME_BRACKET'] = cps_adults['INCOME_CLEAN'].apply(income_bracket)

print("✅ Age cohorts and income brackets created")
print(f"\nAge Cohort Distribution:")
print(cps_adults['AGE_COHORT'].value_counts().sort_index().to_string())
print(f"\nIncome Bracket Distribution:")
bracket_order = ['Negative/Loss', 'Under $25K', '$25K-$50K', '$50K-$75K', '$75K-$100K', '$100K+']
for b in bracket_order:
    cnt = (cps_adults['INCOME_BRACKET'] == b).sum()
    print(f"  {b}: {cnt:,}")

# [Section Comment]:
# ## 4. Data Merging & Feature Engineering
# 
# ### 4.1 Geographic Join
# Merge individual CPS microdata with state-level migration flows on `STATE_NAME` + `YEAR`. This enriches each individual record with their state's macro migration context.

# -----------------------------------------------------
# Code Cell 13
# -----------------------------------------------------
# Merge CPS with State Flows on STATE_NAME + YEAR
merged = cps_adults.merge(
    state_flows[['STATE_NAME', 'YEAR', 'TOTAL_POP', 'MOBILITY_RATE',
                 'INTERSTATE_INFLOW_RATE', 'DIFF_STATE_INFLOW', 'MOVERS']],
    on=['STATE_NAME', 'YEAR'],
    how='left'
)

print(f"✅ Merged dataset: {merged.shape[0]:,} rows × {merged.shape[1]} columns")
print(f"   Rows with state flow data: {merged['MOBILITY_RATE'].notna().sum():,}")
print(f"   Rows missing state flow data: {merged['MOBILITY_RATE'].isna().sum():,}")

# Drop rows without state flow match (small number)
merged = merged.dropna(subset=['MOBILITY_RATE'])
print(f"   Final merged rows: {merged.shape[0]:,}")

# [Section Comment]:
# ### 4.2 Migration Pressure Index
# Engineer a composite **Migration Pressure Index** for each state-year combination. This captures the relative migration "push" pressure a state is experiencing.

# -----------------------------------------------------
# Code Cell 15
# -----------------------------------------------------
# Calculate Migration Pressure Index per state-year
# MPI = MOBILITY_RATE × (1 + INTERSTATE_INFLOW_RATE) — higher = more migration pressure
# We also compute a net pressure score using the state's outflow vs inflow ratio

state_pressure = merged.groupby(['STATE_NAME', 'YEAR']).agg(
    state_migration_rate=('MIGRATED', 'mean'),  # actual interstate migration rate from microdata
    mobility_rate=('MOBILITY_RATE', 'first'),
    interstate_inflow_rate=('INTERSTATE_INFLOW_RATE', 'first'),
    total_pop=('TOTAL_POP', 'first'),
    n_records=('MIGRATED', 'count')
).reset_index()

# Migration Pressure Index: combine macro mobility with micro migration rates
state_pressure['MIGRATION_PRESSURE_INDEX'] = (
    state_pressure['mobility_rate'] * 100 +
    state_pressure['state_migration_rate'] * 100
) / 2

# Merge MPI back to individual records
merged = merged.merge(
    state_pressure[['STATE_NAME', 'YEAR', 'MIGRATION_PRESSURE_INDEX']],
    on=['STATE_NAME', 'YEAR'],
    how='left'
)

print("✅ Migration Pressure Index calculated")
print(f"\nTop 10 States by Average Migration Pressure Index:")
top_pressure = state_pressure.groupby('STATE_NAME')['MIGRATION_PRESSURE_INDEX'].mean().sort_values(ascending=False).head(10)
for state, mpi in top_pressure.items():
    print(f"  {state}: {mpi:.2f}")

# [Section Comment]:
# ## 5. Exploratory Data Analysis (EDA)
# 
# Six publication-quality visualizations exploring migration patterns across demographics and geography.
# 
# ### 5.1 Top States by Net Outflow

# -----------------------------------------------------
# Code Cell 17
# -----------------------------------------------------
# Visualization 1: Top 5 Outflow States
fig, ax = plt.subplots(figsize=(12, 6))

# Calculate average interstate migration rate by state
state_migration = merged.groupby('STATE_NAME')['MIGRATED'].mean().sort_values(ascending=False)
top_5 = state_migration.head(10)

colors = plt.cm.Reds(np.linspace(0.4, 0.9, len(top_5)))
bars = ax.barh(range(len(top_5)), top_5.values * 100, color=colors)
ax.set_yticks(range(len(top_5)))
ax.set_yticklabels(top_5.index)
ax.invert_yaxis()
ax.set_xlabel('Interstate Migration Rate (%)', fontsize=13)
ax.set_title('Top 10 States by Interstate Migration Rate (2010–2019)', fontsize=15, fontweight='bold')

# Add value labels
for bar, val in zip(bars, top_5.values):
    ax.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height()/2,
            f'{val*100:.2f}%', va='center', fontsize=11, fontweight='bold')

plt.tight_layout()
plt.savefig('data/eda_top_outflow_states.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_top_outflow_states.png")

# [Section Comment]:
# ### 5.2 Migration Rate Trends Over Time (2010–2019)

# -----------------------------------------------------
# Code Cell 19
# -----------------------------------------------------
# Visualization 2: Migration Trends Over Time
fig, ax = plt.subplots(figsize=(12, 6))

yearly = merged.groupby('YEAR')['MIGRATED'].mean() * 100

ax.plot(yearly.index, yearly.values, 'o-', color='#2563eb', linewidth=2.5, markersize=8, zorder=5)
ax.fill_between(yearly.index, yearly.values, alpha=0.15, color='#2563eb')

ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('Interstate Migration Rate (%)', fontsize=13)
ax.set_title('U.S. Interstate Migration Rate Trend (2010–2019)', fontsize=15, fontweight='bold')
ax.set_xticks(range(2010, 2020))
ax.grid(True, alpha=0.3)

# Annotate min and max
max_yr = yearly.idxmax()
min_yr = yearly.idxmin()
ax.annotate(f'Peak: {yearly[max_yr]:.2f}%', xy=(max_yr, yearly[max_yr]),
            xytext=(max_yr+0.5, yearly[max_yr]+0.1), fontsize=11,
            arrowprops=dict(arrowstyle='->', color='red'), color='red', fontweight='bold')
ax.annotate(f'Low: {yearly[min_yr]:.2f}%', xy=(min_yr, yearly[min_yr]),
            xytext=(min_yr-1.5, yearly[min_yr]-0.15), fontsize=11,
            arrowprops=dict(arrowstyle='->', color='green'), color='green', fontweight='bold')

plt.tight_layout()
plt.savefig('data/eda_migration_trends.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_migration_trends.png")

# [Section Comment]:
# ### 5.3 Age Cohort Migration Patterns

# -----------------------------------------------------
# Code Cell 21
# -----------------------------------------------------
# Visualization 3: Age Cohort Migration Patterns
fig, ax = plt.subplots(figsize=(12, 6))

cohort_order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
cohort_rates = merged.groupby('AGE_COHORT')['MIGRATED'].mean().reindex(cohort_order) * 100

colors_age = ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981']
bars = ax.bar(cohort_order, cohort_rates.values, color=colors_age, edgecolor='white', linewidth=1.5)

ax.set_xlabel('Age Cohort', fontsize=13)
ax.set_ylabel('Interstate Migration Rate (%)', fontsize=13)
ax.set_title('Interstate Migration Rate by Age Cohort (2010–2019)', fontsize=15, fontweight='bold')

for bar, val in zip(bars, cohort_rates.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
            f'{val:.2f}%', ha='center', fontsize=11, fontweight='bold')

plt.tight_layout()
plt.savefig('data/eda_age_cohort_migration.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_age_cohort_migration.png")

# [Section Comment]:
# ### 5.4 Income vs. Relocation Probability

# -----------------------------------------------------
# Code Cell 23
# -----------------------------------------------------
# Visualization 4: Income vs. Relocation Probability (Box Plot)
fig, ax = plt.subplots(figsize=(12, 6))

# Compare income distributions: movers vs stayers
plot_data = merged[merged['INCOME_CLEAN'].between(-50000, 300000)].copy()
plot_data['Migration Status'] = plot_data['MIGRATED'].map({0: 'Stayed', 1: 'Moved Interstate'})

sns.violinplot(data=plot_data, x='Migration Status', y='INCOME_CLEAN',
               palette=['#10b981', '#ef4444'], inner='quartile', ax=ax)

ax.set_ylabel('Total Income ($)', fontsize=13)
ax.set_xlabel('')
ax.set_title('Income Distribution: Interstate Movers vs. Stayers (2010–2019)', fontsize=15, fontweight='bold')
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))

# Add median annotations
for i, status in enumerate(['Stayed', 'Moved Interstate']):
    subset = plot_data[plot_data['Migration Status'] == status]['INCOME_CLEAN']
    median_val = subset.median()
    ax.text(i, median_val + 5000, f'Median: ${median_val:,.0f}', ha='center',
            fontsize=10, fontweight='bold', color='white',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='black', alpha=0.7))

plt.tight_layout()
plt.savefig('data/eda_income_vs_migration.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_income_vs_migration.png")

# [Section Comment]:
# ### 5.5 Education Level — Movers vs. Stayers

# -----------------------------------------------------
# Code Cell 25
# -----------------------------------------------------
# Visualization 5: Education Distribution — Movers vs Stayers
fig, ax = plt.subplots(figsize=(12, 6))

educ_order = ['None/Preschool', 'Less than High School', 'High School/GED',
              'Some College/Associate', "Bachelor's", 'Graduate/Professional']

# Calculate migration rate by education level
educ_rates = merged.groupby('EDUC_GROUP')['MIGRATED'].agg(['mean', 'count']).reindex(educ_order)
educ_rates['mean'] *= 100

colors_educ = plt.cm.viridis(np.linspace(0.2, 0.9, len(educ_order)))
bars = ax.bar(range(len(educ_order)), educ_rates['mean'].values, color=colors_educ,
              edgecolor='white', linewidth=1.5)

ax.set_xticks(range(len(educ_order)))
ax.set_xticklabels(educ_order, rotation=25, ha='right', fontsize=10)
ax.set_ylabel('Interstate Migration Rate (%)', fontsize=13)
ax.set_title('Interstate Migration Rate by Education Level (2010–2019)', fontsize=15, fontweight='bold')

for bar, val in zip(bars, educ_rates['mean'].values):
    if not np.isnan(val):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                f'{val:.2f}%', ha='center', fontsize=10, fontweight='bold')

plt.tight_layout()
plt.savefig('data/eda_education_migration.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_education_migration.png")

# [Section Comment]:
# ### 5.6 Migration Pressure Index Heatmap (State × Year)

# -----------------------------------------------------
# Code Cell 27
# -----------------------------------------------------
# Visualization 6: Migration Pressure Index Heatmap
fig, ax = plt.subplots(figsize=(16, 10))

# Pivot for heatmap
pivot = state_pressure.pivot_table(
    index='STATE_NAME', columns='YEAR', values='MIGRATION_PRESSURE_INDEX'
)

# Sort by average pressure
pivot = pivot.loc[pivot.mean(axis=1).sort_values(ascending=False).index]

# Show top 25 states for readability
pivot_top = pivot.head(25)

cmap = LinearSegmentedColormap.from_list('risk', ['#10b981', '#fbbf24', '#ef4444'])
sns.heatmap(pivot_top, annot=True, fmt='.1f', cmap=cmap, linewidths=0.5,
            linecolor='white', ax=ax, cbar_kws={'label': 'Migration Pressure Index'})

ax.set_title('Migration Pressure Index: Top 25 States (2010–2019)', fontsize=15, fontweight='bold')
ax.set_xlabel('Year', fontsize=13)
ax.set_ylabel('')

plt.tight_layout()
plt.savefig('data/eda_pressure_heatmap.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/eda_pressure_heatmap.png")

# [Section Comment]:
# ## 6. Feature Engineering for Predictive Model
# 
# Preparing the feature matrix for Logistic Regression. We use a combination of individual demographics and state-level macro indicators.

# -----------------------------------------------------
# Code Cell 29
# -----------------------------------------------------
# Feature Engineering
print("Preparing feature matrix...")

# Select features for modeling
feature_cols_numeric = ['AGE', 'INCOME_CLEAN', 'MOBILITY_RATE', 'INTERSTATE_INFLOW_RATE',
                        'MIGRATION_PRESSURE_INDEX']
feature_cols_categorical = ['SEX', 'RACE_GROUP', 'EDUC_GROUP', 'AGE_COHORT']

# Create modeling dataframe
model_df = merged[feature_cols_numeric + feature_cols_categorical + ['MIGRATED', 'YEAR', 'STATE_NAME']].copy()
model_df = model_df.dropna()

print(f"Modeling dataset: {model_df.shape[0]:,} rows")
print(f"Target distribution:\n{model_df['MIGRATED'].value_counts().to_string()}")
print(f"Migration rate: {model_df['MIGRATED'].mean():.4f}")

# One-hot encode categorical features
model_encoded = pd.get_dummies(model_df, columns=feature_cols_categorical, drop_first=True)

# Define feature matrix and target
feature_columns = [c for c in model_encoded.columns
                   if c not in ['MIGRATED', 'YEAR', 'STATE_NAME']]
X = model_encoded[feature_columns]
y = model_encoded['MIGRATED']

print(f"\nFeature matrix shape: {X.shape}")
print(f"Features ({len(feature_columns)}):")
for col in feature_columns:
    print(f"  • {col}")

# [Section Comment]:
# ## 7. Logistic Regression Model
# 
# ### 7.1 Temporal Train/Test Split
# Using a **temporal split** (2010–2017 for training, 2018–2019 for testing) to prevent data leakage and simulate real-world deployment where we predict future migration from historical patterns.

# -----------------------------------------------------
# Code Cell 31
# -----------------------------------------------------
# Temporal split: Train on 2010-2017, Test on 2018-2019
train_mask = model_encoded['YEAR'] <= 2017
test_mask = model_encoded['YEAR'] >= 2018

X_train = X[train_mask]
X_test = X[test_mask]
y_train = y[train_mask]
y_test = y[test_mask]

print(f"Training set: {X_train.shape[0]:,} samples ({y_train.mean():.2%} positive)")
print(f"Testing set:  {X_test.shape[0]:,} samples ({y_test.mean():.2%} positive)")
print(f"\nTrain years: 2010–2017")
print(f"Test years:  2018–2019")

# Scale numeric features
scaler = StandardScaler()
numeric_features = ['AGE', 'INCOME_CLEAN', 'MOBILITY_RATE', 'INTERSTATE_INFLOW_RATE',
                    'MIGRATION_PRESSURE_INDEX']
numeric_idx = [feature_columns.index(f) for f in numeric_features if f in feature_columns]

# Convert to float to avoid dtype mismatch with StandardScaler output
X_train_scaled = X_train.astype(float).copy()
X_test_scaled = X_test.astype(float).copy()
X_train_scaled.iloc[:, numeric_idx] = scaler.fit_transform(X_train.iloc[:, numeric_idx].astype(float))
X_test_scaled.iloc[:, numeric_idx] = scaler.transform(X_test.iloc[:, numeric_idx].astype(float))

print("\n✅ Features scaled (StandardScaler)")

# [Section Comment]:
# ### 7.2 Model Training

# -----------------------------------------------------
# Code Cell 33
# -----------------------------------------------------
# Train Logistic Regression
print("Training Logistic Regression model...")

model = LogisticRegression(
    max_iter=1000,
    class_weight='balanced',  # Handle class imbalance
    solver='lbfgs',
    random_state=42,
    C=1.0
)

model.fit(X_train_scaled, y_train)

print("✅ Model trained successfully!")
print(f"   Solver: {model.solver}")
print(f"   Class weights: balanced")
print(f"   Iterations used: {model.n_iter_[0]}")
print(f"   Number of features: {X_train_scaled.shape[1]}")

# [Section Comment]:
# ### 7.3 Model Evaluation

# -----------------------------------------------------
# Code Cell 35
# -----------------------------------------------------
# Predictions
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

# Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_proba)

print("=" * 50)
print("     MODEL EVALUATION RESULTS")
print("=" * 50)
print(f"  Accuracy:  {accuracy:.4f}  ({accuracy:.2%})")
print(f"  Precision: {precision:.4f}  ({precision:.2%})")
print(f"  Recall:    {recall:.4f}  ({recall:.2%})")
print(f"  F1 Score:  {f1:.4f}  ({f1:.2%})")
print(f"  ROC AUC:   {auc:.4f}  ({auc:.2%})")
print("=" * 50)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Stayed', 'Migrated']))

# [Section Comment]:
# ### 7.4 Confusion Matrix

# -----------------------------------------------------
# Code Cell 37
# -----------------------------------------------------
# Confusion Matrix Visualization
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt=',d', cmap='Blues', ax=axes[0],
            xticklabels=['Stayed', 'Migrated'], yticklabels=['Stayed', 'Migrated'])
axes[0].set_xlabel('Predicted', fontsize=13)
axes[0].set_ylabel('Actual', fontsize=13)
axes[0].set_title('Confusion Matrix', fontsize=14, fontweight='bold')

# ROC Curve
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
axes[1].plot(fpr, tpr, 'b-', linewidth=2.5, label=f'Logistic Regression (AUC = {auc:.4f})')
axes[1].plot([0, 1], [0, 1], 'r--', linewidth=1, alpha=0.7, label='Random Classifier')
axes[1].fill_between(fpr, tpr, alpha=0.1, color='blue')
axes[1].set_xlabel('False Positive Rate', fontsize=13)
axes[1].set_ylabel('True Positive Rate', fontsize=13)
axes[1].set_title('ROC Curve', fontsize=14, fontweight='bold')
axes[1].legend(loc='lower right', fontsize=11)
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('data/model_evaluation.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/model_evaluation.png")

# [Section Comment]:
# ### 7.5 Feature Importance

# -----------------------------------------------------
# Code Cell 39
# -----------------------------------------------------
# Feature Importance (Logistic Regression Coefficients)
fig, ax = plt.subplots(figsize=(12, 8))

coef_df = pd.DataFrame({
    'Feature': feature_columns,
    'Coefficient': model.coef_[0]
}).sort_values('Coefficient', key=abs, ascending=True)

colors_coef = ['#ef4444' if c > 0 else '#3b82f6' for c in coef_df['Coefficient']]
bars = ax.barh(range(len(coef_df)), coef_df['Coefficient'].values, color=colors_coef)
ax.set_yticks(range(len(coef_df)))
ax.set_yticklabels(coef_df['Feature'].values, fontsize=9)
ax.set_xlabel('Coefficient Value', fontsize=13)
ax.set_title('Feature Importance — Logistic Regression Coefficients', fontsize=15, fontweight='bold')
ax.axvline(x=0, color='black', linewidth=0.8, linestyle='-')

# Legend
from matplotlib.patches import Patch
legend_elements = [Patch(facecolor='#ef4444', label='Increases Migration Risk'),
                   Patch(facecolor='#3b82f6', label='Decreases Migration Risk')]
ax.legend(handles=legend_elements, loc='lower right', fontsize=11)

plt.tight_layout()
plt.savefig('data/feature_importance.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/feature_importance.png")

# [Section Comment]:
# ## 8. Risk Scoring & State-Level Predictions
# 
# Generate per-individual risk probabilities and aggregate to state-level risk scores.

# -----------------------------------------------------
# Code Cell 41
# -----------------------------------------------------
# Generate risk scores for all test data
test_results = model_encoded[test_mask][['YEAR', 'STATE_NAME']].copy()
test_results['RISK_SCORE'] = y_pred_proba
test_results['RISK_CATEGORY'] = pd.cut(
    y_pred_proba,
    bins=[0, 0.3, 0.6, 1.0],
    labels=['Low Risk', 'Medium Risk', 'High Risk']
)
test_results['ACTUAL'] = y_test.values
test_results['PREDICTED'] = y_pred

# State-level risk aggregation
state_risk = test_results.groupby('STATE_NAME').agg(
    avg_risk_score=('RISK_SCORE', 'mean'),
    high_risk_pct=('RISK_CATEGORY', lambda x: (x == 'High Risk').mean()),
    actual_migration_rate=('ACTUAL', 'mean'),
    n_individuals=('RISK_SCORE', 'count')
).sort_values('avg_risk_score', ascending=False).reset_index()

print("=" * 65)
print("     STATE-LEVEL MIGRATION RISK ASSESSMENT (2018–2019)")
print("=" * 65)
print(f"{'State':<25} {'Avg Risk':>10} {'High Risk %':>12} {'Actual Rate':>12} {'N':>8}")
print("-" * 65)
for _, row in state_risk.head(15).iterrows():
    print(f"{row['STATE_NAME']:<25} {row['avg_risk_score']:>10.4f} {row['high_risk_pct']:>11.2%} {row['actual_migration_rate']:>11.2%} {row['n_individuals']:>8,}")

print(f"\n📊 Total states analyzed: {len(state_risk)}")
print(f"📊 Overall avg risk score: {state_risk['avg_risk_score'].mean():.4f}")

# -----------------------------------------------------
# Code Cell 42
# -----------------------------------------------------
# Visualize State Risk Rankings
fig, ax = plt.subplots(figsize=(14, 8))

top_risk = state_risk.head(20)
colors_risk = plt.cm.RdYlGn_r(np.linspace(0.2, 0.9, len(top_risk)))

bars = ax.barh(range(len(top_risk)), top_risk['avg_risk_score'].values, color=colors_risk)
ax.set_yticks(range(len(top_risk)))
ax.set_yticklabels(top_risk['STATE_NAME'].values)
ax.invert_yaxis()
ax.set_xlabel('Average Migration Risk Score', fontsize=13)
ax.set_title('Top 20 States by Migration Risk Score (2018–2019 Predictions)', fontsize=15, fontweight='bold')

for bar, val in zip(bars, top_risk['avg_risk_score'].values):
    ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height()/2,
            f'{val:.4f}', va='center', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig('data/state_risk_rankings.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/state_risk_rankings.png")

# -----------------------------------------------------
# Code Cell 43
# -----------------------------------------------------
# Risk Category Distribution
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Pie chart of risk categories
risk_counts = test_results['RISK_CATEGORY'].value_counts()
colors_pie = ['#10b981', '#f59e0b', '#ef4444']
axes[0].pie(risk_counts.values, labels=risk_counts.index, colors=colors_pie,
            autopct='%1.1f%%', startangle=140, textprops={'fontsize': 12})
axes[0].set_title('Risk Category Distribution', fontsize=14, fontweight='bold')

# Predicted vs Actual by state
scatter_data = state_risk.copy()
scatter = axes[1].scatter(scatter_data['actual_migration_rate'] * 100,
                          scatter_data['avg_risk_score'] * 100,
                          s=scatter_data['n_individuals'] / 5,
                          c=scatter_data['avg_risk_score'],
                          cmap='RdYlGn_r', alpha=0.7, edgecolors='black', linewidth=0.5)
axes[1].set_xlabel('Actual Migration Rate (%)', fontsize=13)
axes[1].set_ylabel('Predicted Risk Score (%)', fontsize=13)
axes[1].set_title('Predicted Risk vs. Actual Migration Rate', fontsize=14, fontweight='bold')

# Add state labels for top 5
for _, row in scatter_data.head(5).iterrows():
    axes[1].annotate(row['STATE_NAME'],
                    (row['actual_migration_rate']*100, row['avg_risk_score']*100),
                    fontsize=8, fontweight='bold')

plt.colorbar(scatter, ax=axes[1], label='Risk Score')
plt.tight_layout()
plt.savefig('data/risk_analysis_summary.png', dpi=150, bbox_inches='tight')
plt.show()
print("💾 Saved: data/risk_analysis_summary.png")

# [Section Comment]:
# ## 9. Export Results for Dashboard

# -----------------------------------------------------
# Code Cell 45
# -----------------------------------------------------
# Export state-level risk data for the dashboard
state_risk.to_csv('data/state_risk_scores.csv', index=False)
print(f"✅ Exported state_risk_scores.csv ({len(state_risk)} states)")

# Export individual predictions (sample for dashboard)
sample_predictions = model_encoded[test_mask].copy()
sample_predictions['RISK_SCORE'] = y_pred_proba
sample_predictions['RISK_CATEGORY'] = pd.cut(
    y_pred_proba, bins=[0, 0.3, 0.6, 1.0],
    labels=['Low Risk', 'Medium Risk', 'High Risk']
)
# Take a representative sample of 2000 records for the dashboard
sample_export = sample_predictions.sample(n=min(2000, len(sample_predictions)), random_state=42)
export_cols = ['YEAR', 'STATE_NAME', 'AGE', 'INCOME_CLEAN', 'MOBILITY_RATE',
               'MIGRATION_PRESSURE_INDEX', 'RISK_SCORE', 'RISK_CATEGORY']
available_cols = [c for c in export_cols if c in sample_export.columns]
sample_export[available_cols].to_csv('data/individual_predictions.csv', index=False)
print(f"✅ Exported individual_predictions.csv ({len(sample_export)} records)")

# Export EDA summary stats
eda_summary = {
    'total_records': int(len(merged)),
    'total_states': int(merged['STATE_NAME'].nunique()),
    'year_range': f"{int(merged['YEAR'].min())}-{int(merged['YEAR'].max())}",
    'overall_migration_rate': float(merged['MIGRATED'].mean()),
    'model_accuracy': float(accuracy),
    'model_precision': float(precision),
    'model_recall': float(recall),
    'model_f1': float(f1),
    'model_auc': float(auc),
    'highest_risk_state': state_risk.iloc[0]['STATE_NAME'],
    'highest_risk_score': float(state_risk.iloc[0]['avg_risk_score'])
}

import json
with open('data/eda_summary.json', 'w') as f:
    json.dump(eda_summary, f, indent=2)
print(f"✅ Exported eda_summary.json")

print("\n📊 All results exported to data/ directory for dashboard integration!")

# [Section Comment]:
# ## 10. Conclusions & Business Recommendations
# 
# ### Key Findings
# 
# 1. **Migration Rate Trends:** Interstate migration rates fluctuated across the decade, with identifiable peak and trough years correlated with economic cycles.
# 
# 2. **Age is the Strongest Predictor:** Young adults (18–34) have the highest interstate migration rates, making them the primary demographic at risk of state outflow.
# 
# 3. **Education Amplifies Mobility:** Higher education levels (Bachelor's and Graduate degrees) correlate with increased interstate migration, likely driven by job market flexibility.
# 
# 4. **Income Effect:** Interstate movers tend to have different income distributions than stayers — both very low and very high income earners show elevated migration probabilities.
# 
# 5. **State-Level Pressure:** The Migration Pressure Index successfully captures states under migration stress, with traditionally high-outflow states (e.g., New York, Illinois, California) consistently showing elevated pressure scores.
# 
# ### Strategic Policy Recommendations
# 
# | Recommendation | Target Audience | Expected Impact |
# |---------------|----------------|-----------------|
# | **Youth Retention Programs** | State governments | Retain 18–34 year-old cohort through career development incentives |
# | **Tax Incentive Zones** | High-outflow states | Reduce net outflow by offering tax breaks to at-risk demographics |
# | **Affordable Housing Initiatives** | High-cost states | Address cost-of-living as a primary migration push factor |
# | **Early Warning System** | Policy planners | Deploy this model as a real-time risk dashboard for quarterly monitoring |
# | **Targeted Business Development** | Economic development agencies | Attract employers to high-outflow regions to create job anchors |
# 
# ### Model Limitations
# - **ASEC Supplement Coverage:** MIGRATE1 is only available in the March ASEC supplement, limiting sample size.
# - **Binary Classification:** Real migration decisions are multi-factorial; binary classification may oversimplify.
# - **Temporal Validity:** Model trained on 2010–2017 data; migration patterns post-COVID may differ significantly.
# - **Ecological Fallacy:** Individual-level predictions enriched with state-level data may conflate individual and group-level effects.
# 
# ### Next Steps
# - Deploy the full-stack **Risk Intelligence Platform** (React dashboard + Node.js API + Supabase) for interactive exploration.
# - Incorporate additional data sources (IRS SOI migration data, BLS employment data) for improved prediction accuracy.
# - Upgrade to ensemble methods (Random Forest, XGBoost) for potentially higher predictive performance.
