import json
from typing import List, Dict, Any
from app.core.db import get_chroma_collection

class RAGService:
    def __init__(self):
        self.collection = get_chroma_collection()

    def add_dashboard(self, dashboard_id: str, context: str, kpis: List[Dict], visualizations: List[Dict]):
        """
        Embeds the dashboard context and summary into ChromaDB.
        """
        # Create a rich text representation for embedding
        kpi_names = ", ".join([k.get("name", "") if isinstance(k, dict) else getattr(k, "name", "") for k in kpis])
        viz_titles = ", ".join([v.get("title", "") if isinstance(v, dict) else getattr(v, "title", "") for v in visualizations])
        
        document_text = f"Context: {context}\nKPIs: {kpi_names}\nVisualizations: {viz_titles}"
        
        # Store metadata for retrieval
        metadata = {
            "dashboard_id": str(dashboard_id),
            "context": context
        }
        
        self.collection.add(
            documents=[document_text],
            metadatas=[metadata],
            ids=[str(dashboard_id)]
        )

    def query_similar(self, context: str, n_results: int = 3) -> List[Dict]:
        """
        Retrieves similar past dashboards based on context.
        """
        results = self.collection.query(
            query_texts=[context],
            n_results=n_results
        )
        
        # Format results
        similar_dashboards = []
        if results["ids"]:
            for i, doc_id in enumerate(results["ids"][0]):
                similar_dashboards.append({
                    "id": doc_id,
                    "document": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i]
                })
                
        return similar_dashboards
