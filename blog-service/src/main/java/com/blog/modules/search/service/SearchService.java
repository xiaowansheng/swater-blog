package com.blog.modules.search.service;


import com.blog.shared.PageResult;
import com.blog.modules.search.model.vo.SearchVO;
public interface SearchService {
    PageResult<SearchVO> search(String keyword, String type, Long page, Long size);
}

