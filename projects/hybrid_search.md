---
layout: project
type: project
image: img/hybrid_search/pg+pgvector.png
title: "Hybrid search in Postgres"
date: 2024
published: true
labels:
  - retrieval-augmented-generation 
  - vector-database 
  - postgresql 
  - machine-learning 
  - pgvector 
  - docker
  - hybrid-search 
  - add-recency-in-hybrid-search
summary: "Build a hybrid search system (semantic + keyword search) in postgres that prioritizes recency, making it ideal for dynamic domains like news and social media. It leverages PostgreSQL's pgvector extension to enable efficient vector search within the database, ensuring a balance between relevance and freshness in retrieval-augmented generation (RAG) applications."
---

<div class="text-center p-4">
  <img width="500px" src="../img/hybrid_search/pg-vector.png" class="img-thumbnail" >
</div>

This work offers a comprehensive setup for implementing a hybrid search system that emphasizes recency in search results using postgres. In many real-world scenarios, retrieving the most recent information is crucial, especially in dynamic domains like news, social media, or stock market data. This system is designed to balance relevance and freshness, ensuring that users receive the latest and most pertinent results.

The solution leverages PostgreSQL's pgvector extension, which allows for efficient handling of vector data within the database. By integrating vector search capabilities directly into PostgreSQL, this setup facilitates seamless interactions with vector databases.


Replicate or read more [here](https://github.com/thap2331/hybrid_search_with_recency).