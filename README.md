# Expert Rating Tool for Cognitive Load Assessment

A lightweight browser-based expert rating system for collecting human judgments on learning-content cognitive load. The tool lets experts import JSON samples, score each sample across five dimensions on a 1-10 scale, save progress locally, confirm ratings, and export the final annotations as CSV or JSON.

This repository also includes scripts and outputs for feature extraction, expert-rating generation, and empirical machine-learning analysis of cognitive load labels.

## Repository Description

Expert Rating Tool is a static HTML, CSS, and JavaScript application designed for educational-content annotation. It supports structured expert scoring of linguistic complexity, formula density, knowledge abstractness, structural disorganization, and table or diagram complexity. The exported ratings can be used for cognitive-load modeling, dataset construction, and reproducible empirical analysis.

## Features

- Import JSON or text files containing learning-content samples.
- Rate each sample from 1 to 10 across five expert-defined dimensions.
- Navigate between samples with previous, next, jump, and sidebar controls.
- Auto-save local progress in the browser with `localStorage`.
- Confirm completed ratings and track annotation progress.
- Export expert annotations as CSV or JSON backup files.
- Run supporting Python scripts for feature extraction and empirical analysis.

## Rating Dimensions

The interface collects expert ratings for:

- `linguistic_complexity`: language difficulty, sentence complexity, and technical expression.
- `formula_density`: density of mathematical notation, formulas, symbols, and equation-like content.
- `knowledge_abstractness`: degree of conceptual abstraction and specialized terminology.
- `structural_disorganization`: structural discontinuity, fragmented organization, or hard-to-follow sequencing.
- `table_complexity`: complexity of tables, diagrams, figures, or visual information.

These dimensions are inspired by cognitive load theory, which emphasizes that instructional materials can impose different levels of processing demand on learners (Sweller, 1988), and by subjective rating approaches commonly used to estimate perceived mental effort (Paas, 1992; Paas et al., 2003).

## Input Format

The browser tool expects a JSON array. Each object may contain:

```json
[
  {
    "text": "Sample learning content",
    "image_path": "dataset/images/example.png",
    "cognitive_load_label": 3.2
  }
]
```

Required field:

- `text`

Optional fields:

- `image_path`
- `cognitive_load_label`

## Output Format

CSV exports include:

- `sample_id`
- `expert_name`
- `text`
- `image_path`
- `cognitive_load_label`
- the five rating dimensions
- `confirmed`
- `updated_at`

## How to Use

Open `index.html` in a browser, enter the expert name, import a JSON file, rate each sample, and export the final results.

No build step is required for the web interface because it is implemented with plain HTML, CSS, and JavaScript.

## Analysis Scripts

The repository includes Python scripts for dataset repair, feature extraction, expert-rating generation, and empirical analysis:

- `repair_1530_dataset.py`
- `extract_features_repaired_1530.py`
- `generate_expert_ratings.py`
- `extended_empirical_analysis.py`

The empirical pipeline evaluates machine-learning regressors such as Linear Regression, ElasticNet, Random Forest, Extra Trees, Histogram Gradient Boosting, XGBoost, and stacking models. The current analysis outputs report Extra Trees as the strongest baseline in the included experiment, with mean absolute error of approximately `0.686 +/- 0.039`.

## Reproducibility Notes

Some Python scripts currently contain local absolute paths. Before running the analysis pipeline on another machine, update the dataset, image, term-bank, and output paths to match your local environment.

Recommended Python packages include:

- `numpy`
- `pandas`
- `scikit-learn`
- `xgboost`
- `shap`
- `opencv-python`
- `scikit-image`

## Suggested GitHub Metadata

Short description:

```text
A browser-based expert rating tool and empirical analysis pipeline for cognitive load assessment of learning content.
```

Topics:

```text
cognitive-load, educational-technology, expert-rating, annotation-tool, machine-learning, xgboost, shap, learning-analytics
```

## Citation

If you use this repository in academic work, cite the repository and the relevant methodological sources listed below. Replace the author, year, repository URL, and version with the final GitHub release information.

```text
Bai, Y. (2026). Expert Rating Tool for Cognitive Load Assessment (Version 1.0.0) [Computer software]. GitHub. https://github.com/your-username/expert_ratings
```

## References

Breiman, L. (2001). Random forests. *Machine Learning, 45*(1), 5-32. https://doi.org/10.1023/A:1010933404324

Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 785-794). Association for Computing Machinery. https://doi.org/10.1145/2939672.2939785

Geurts, P., Ernst, D., & Wehenkel, L. (2006). Extremely randomized trees. *Machine Learning, 63*(1), 3-42. https://doi.org/10.1007/s10994-006-6226-1

Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions. In *Advances in Neural Information Processing Systems 30* (pp. 4765-4774). https://papers.neurips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions

Paas, F. G. W. C. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429-434. https://doi.org/10.1037/0022-0663.84.4.429

Paas, F., Renkl, A., & Sweller, J. (2003). Cognitive load theory and instructional design: Recent developments. *Educational Psychologist, 38*(1), 1-4. https://doi.org/10.1207/S15326985EP3801_1

Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. *Journal of Machine Learning Research, 12*, 2825-2830. https://jmlr.org/papers/v12/pedregosa11a.html

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257-285. https://doi.org/10.1207/s15516709cog1202_4
