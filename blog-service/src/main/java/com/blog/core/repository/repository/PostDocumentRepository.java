package com.blog.core.repository;


import com.blog.modules.article.model.document.PostDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
public interface PostDocumentRepository extends ElasticsearchRepository<PostDocument, Long> {
}

