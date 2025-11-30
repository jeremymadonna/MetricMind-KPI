from typing import List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyService:
    def detect_anomalies(self, data: List[Dict[str, Any]], kpi_name: str) -> List[Dict[str, Any]]:
        """
        Detects anomalies in a time-series or sequence of data for a specific KPI.
        Returns the data points that are considered anomalies.
        """
        if not data:
            return []

        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Check if KPI column exists
        # Note: In our current simplified flow, 'kpis' in state is a list of definitions, 
        # but we don't actually have the *time series values* computed yet in the graph state 
        # unless we executed the formulas. 
        # For this phase, we will assume we might receive a list of values if we had an execution engine.
        # However, since we are building a *builder* that outputs specs, we might not have the full data loaded 
        # in the graph state in a way that allows full time-series analysis without executing the formula on the CSV.
        
        # To make this functional within the current architecture:
        # We will assume the 'ingestion' phase (which we skipped slightly in favor of direct CSV text) 
        # could provide a sample.
        
        # For now, let's implement a helper that takes a list of values.
        pass

    def detect_outliers(self, values: List[float]) -> List[bool]:
        """
        Uses Isolation Forest to detect outliers in a list of numerical values.
        Returns a boolean mask (True = anomaly).
        """
        if len(values) < 5:
            # Not enough data for reliable anomaly detection
            return [False] * len(values)

        X = np.array(values).reshape(-1, 1)
        clf = IsolationForest(random_state=42, contamination=0.1)
        preds = clf.fit_predict(X)
        
        # -1 is anomaly, 1 is normal
        return [x == -1 for x in preds]
