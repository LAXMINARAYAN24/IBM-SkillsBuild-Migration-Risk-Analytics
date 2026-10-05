"""Compatibility entry point for the audited migration-analysis pipeline.

Use ``python LaxminarayanSahu_MigrationRiskAnalysis.py`` or, equivalently,
``python migration_pipeline.py``. The earlier notebook export was replaced
because it encoded within-state moves as interstate moves and used outcome
aggregates as predictors.
"""

from migration_pipeline import main


if __name__ == '__main__':
    main()
