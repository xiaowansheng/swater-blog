package com.blog.repository;

import com.blog.model.document.MomentDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface MomentDocumentRepository extends ElasticsearchRepository<MomentDocument, Long> {
}

