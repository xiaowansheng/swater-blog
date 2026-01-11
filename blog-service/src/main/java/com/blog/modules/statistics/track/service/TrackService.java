package com.blog.modules.statistics.track.service;


import com.blog.modules.statistics.track.model.dto.TrackEnterDTO;
import com.blog.modules.statistics.track.model.vo.TrackEnterResultVO;
import jakarta.servlet.http.HttpServletRequest;

public interface TrackService {
    TrackEnterResultVO enter(TrackEnterDTO dto, HttpServletRequest request);
}

