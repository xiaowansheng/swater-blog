package com.blog.service;

import com.blog.model.dto.LoginLogQueryDTO;
import com.blog.model.vo.LoginLogVO;
import com.blog.common.PageResult;

public interface LoginLogService {
    void recordLogin(Long userId, String ip, String ipAddress, String country, String province, 
                     String city, java.math.BigDecimal latitude, java.math.BigDecimal longitude,
                     String locationDetail, String deviceInfo, String device, String browser,
                     String location, String ipSource);

    PageResult<LoginLogVO> list(LoginLogQueryDTO queryDTO);

    LoginLogVO getById(Long id);

    void delete(Long id);
}

