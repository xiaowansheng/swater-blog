package com.blog.core.repository;


import com.blog.modules.comment.model.document.CommentDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
public interface CommentDocumentRepository extends ElasticsearchRepository<CommentDocument, Long> {
}

