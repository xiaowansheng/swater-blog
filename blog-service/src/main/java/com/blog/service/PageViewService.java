package com.blog.service;

import com.blog.model.vo.PageViewVO;

public interface PageViewService {
    void incrementView(String viewType, Long viewId);

    PageViewVO getViewCount(String viewType, Long viewId);

    Long getTotalViewCount(String viewType);
}

