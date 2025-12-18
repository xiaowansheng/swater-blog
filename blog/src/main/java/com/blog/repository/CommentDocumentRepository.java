package com.blog.repository;

import com.blog.model.document.CommentDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface CommentDocumentRepository extends ElasticsearchRepository<CommentDocument, Long> {
}

