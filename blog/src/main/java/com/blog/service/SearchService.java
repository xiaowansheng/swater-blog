package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.SearchVO;

public interface SearchService {
    PageResult<SearchVO> search(String keyword, String type, Long page, Long size);
}

