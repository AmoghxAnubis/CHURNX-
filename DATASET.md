# Dataset used in ChurnX

ChurnX uses the **IBM Telco Customer Churn** sample dataset to learn patterns associated with customers leaving a telecommunications service. Each row represents one customer snapshot, including their services, account details, charges, and observed churn label.

## Source and local files

The dataset comes from the [IBM Telco Customer Churn repository](https://github.com/IBM/telco-customer-churn-on-icp4d/blob/master/data/Telco-Customer-Churn.csv). It is a fictional sample used for analysis and demonstration.

| File | Purpose |
|---|---|
| [Original CSV](data/raw/Telco-Customer-Churn.csv) | Source customer records retained separately from cleaning outputs |
| [Cleaned CSV](data/processed/churn_cleaned.csv) | Validated data with numerical charge values, before encoding or scaling |
| [Exploratory analysis](reports/eda.json) | Dataset summaries, missing-value counts after cleaning, and grouped churn rates |
| [Split identifiers](reports/splits.json) | Customer IDs assigned to training, validation, and test partitions |

## Size and prediction target

The source CSV contains **7,043 customers and 21 columns**:

- **19 input features** describing the customer, account, services, and billing.
- **`customerID`**, a unique record identifier excluded from model inputs.
- **`Churn`**, the outcome the model learns to predict, also excluded from inputs.

| Target value | Meaning | Customers | Share |
|---|---|---:|---:|
| `Yes` | Customer churned | 1,869 | 26.54% |
| `No` | Customer did not churn | 5,174 | 73.46% |

Training maps `Yes` to **1** and `No` to **0**, making this a supervised binary classification task. Because the classes are unequal, accuracy alone is insufficient: predicting `No` for everyone would already achieve about 73.46% accuracy. ChurnX also evaluates ROC-AUC, PR-AUC, recall, precision, and F1.

## What the columns describe

| Group | Dataset columns | Description |
|---|---|---|
| Identifier | `customerID` | Unique customer identifier; used for traceability and split records |
| Customer details | `gender`, `SeniorCitizen`, `Partner`, `Dependents` | Demographic and household attributes; `SeniorCitizen` uses 0/1 |
| Account duration | `tenure` | Number of months the customer has stayed with the company |
| Phone services | `PhoneService`, `MultipleLines` | Whether phone service and multiple lines are present |
| Internet service | `InternetService` | DSL, Fiber optic, or No |
| Internet-related services | `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies` | Whether each additional service is present or internet service is unavailable |
| Contract and payment | `Contract`, `PaperlessBilling`, `PaymentMethod` | Contract duration, paperless billing preference, and payment method |
| Charges | `MonthlyCharges`, `TotalCharges` | Monthly and cumulative charges in USD |
| Outcome | `Churn` | Observed Yes/No churn label |

See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for every input's allowed values and its corresponding API field name.

## Cleaning and preprocessing

The implementation is in [ml/train.py](ml/train.py), with validation rules in [backend/schema.py](backend/schema.py).

1. Validate that the source has the expected 21 columns, unique nonempty customer IDs, and valid target labels.
2. Convert `TotalCharges` to numeric values. The source has **11 blank entries**, all belonging to customers with **zero months of tenure**; these entries become **0**.
3. Validate categories, numerical bounds, and service dependencies. For example, a customer without internet service must have `No internet service` for internet-related services. This is a meaningful category, not a missing value.
4. Save a separate cleaned CSV, leaving the raw source file in place.
5. Fit numerical median imputation and standard scaling, plus categorical most-frequent imputation and one-hot encoding, inside the model pipeline. During cross-validation these transformations fit only on each training fold.

The cleaned CSV is not globally encoded or scaled. Keeping preprocessing inside the fitted pipeline prevents validation/test data from influencing learned preprocessing and ensures inference uses the same transformations as training.

## How ChurnX uses the data

The pipeline creates disjoint, stratified partitions with random seed **42**, preserving approximately the same churn proportion in each partition.

| Partition | Customers | Purpose |
|---|---:|---|
| Training | 4,507 | Fit preprocessing, compare model families with five-fold cross-validation, and tune the selected family |
| Validation | 1,127 | Select the classification threshold and measure permutation feature importance |
| Test | 1,409 | Measure final performance on held-out customers |

The saved model remains fitted to the training partition. ChurnX separately scores all 7,043 customers for the dashboard, so dashboard scores include training records. Those scores are useful for exploring the sample; the held-out test results are the evidence for generalization.

The Insights view displays observed churn rates grouped by attributes such as contract type, tenure, internet service, and technical support. Individual predictions use the same 19 input fields and return a probability, risk band, classification, and model-sensitivity explanation. See [MODEL_CARD.md](MODEL_CARD.md) for evaluation results and interpretation.

## Limitations

- This is a fictional telecom sample; performance does not establish suitability for another company, industry, or current customer population.
- Records are customer snapshots, not a sequence of monthly events. The model does not predict a cancellation date or a defined 30-day churn outcome.
- Associations between attributes and churn do not prove that changing an attribute will prevent churn. Sensitivity explanations are not causal effects.
- Demographic fields are included in the model, and subgroup evaluation is recorded in model metadata. These results require review before applying the model to real customers.
- Real-world use requires representative data, appropriate access controls, and evaluation against the intended business setting.

## Reproducing the dataset preparation

From the repository root, with the Python dependencies installed:

```powershell
.\.venv\Scripts\python.exe -m ml.train --download
```

This downloads the source only if it is absent, then regenerates the cleaned CSV, analysis reports, split records, and trained model artifacts. It also retrains the model; it is not solely a data-cleaning command.
