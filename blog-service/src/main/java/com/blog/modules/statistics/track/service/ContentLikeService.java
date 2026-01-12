package com.blog.modules.statistics.track.service;


import com.blog.modules.statistics.track.model.dto.ContentLikeActionDTO;
import com.blog.modules.statistics.track.model.vo.ContentLikeResultVO;
import com.blog.modules.statistics.track.model.vo.ContentLikeStatusVO;
import jakarta.servlet.http.HttpServletRequest;

public interface ContentLikeService {
    ContentLikeResultVO action(ContentLikeActionDTO dto, HttpServletRequest request);

    ContentLikeStatusVO status(String visitorUuid, String contentType, Long contentId);
}

