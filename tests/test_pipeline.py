import unittest
import numpy as np
import pandas as pd
from migration_pipeline import clean_records, temporal_split, make_model, fit_model, FEATURES, select_threshold


class PipelineTests(unittest.TestCase):
    def test_official_labels_and_income_sentinels(self):
        raw = pd.DataFrame({'YEAR': [2011]*7, 'ASECFLAG': [1]*7, 'AGE': [30]*7,
            'MIGRATE1': [0, 1, 3, 4, 5, 6, 9], 'STATEFIP': [6]*7,
            'ASECWT': [1]*7, 'INCTOT': [0, -100, 999999998, 999999999, 50000, 0, 0]})
        clean = clean_records(raw)
        self.assertEqual(clean.MIGRATED.tolist(), [0, 0, 0, 1])
        self.assertEqual(clean.INCOME_CLEAN.isna().sum(), 2)
        self.assertLess(clean.LOG_INCOME.iloc[0], 0)

    def test_person_purge_and_year_boundaries(self):
        d = pd.DataFrame({'YEAR': [2015, 2016, 2017, 2018, 2010, 2019],
                          'CPSIDP': [10, 10, 20, 20, 0, 0]})
        train, valid, test = temporal_split(d)
        self.assertEqual(train.CPSIDP.tolist(), [0])
        self.assertEqual(valid.CPSIDP.tolist(), [10])
        self.assertEqual(test.CPSIDP.tolist(), [20, 0])

    def test_unknown_categories_and_missing_income_predict(self):
        n = 240
        d = pd.DataFrame({'AGE': np.tile([20, 40, 60], 80), 'LOG_INCOME': np.arange(n)/20,
                          'AGE_SQUARED': np.tile([400, 1600, 3600], 80),
                          'STATEFIP': np.tile([6, 12], 120), 'SEX': 1, 'RACE': 100,
                          'EDUC': 73, 'ASECWT': 1, 'MIGRATED': np.tile([0, 1, 0], 80)})
        test = d.iloc[:2].copy()
        test['STATEFIP'] = 99
        test['LOG_INCOME'] = np.nan
        for kind in ['logistic', 'boosting']:
            model = fit_model(make_model(kind), d)
            p = model.predict_proba(test[FEATURES])[:, 1]
            self.assertTrue(np.isfinite(p).all())
            self.assertTrue(((p >= 0) & (p <= 1)).all())

    def test_threshold_selects_known_optimum(self):
        self.assertAlmostEqual(select_threshold([0, 0, 1, 1], [.01, .02, .08, .1]), .08)


if __name__ == '__main__':
    unittest.main()
