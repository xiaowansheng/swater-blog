package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.mapper.LoginLogMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.LoginLogQueryDTO;
import com.blog.model.entity.LoginLog;
import com.blog.model.entity.User;
import com.blog.model.vo.LoginLogVO;
import com.blog.service.LoginLogService;
import com.blog.common.PageResult;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoginLogServiceImpl implements LoginLogService {
    @Autowired
    private LoginLogMapper loginLogMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public void recordLogin(Long userId, String ip, String ipAddress, String country, String province,
                            String city, java.math.BigDecimal latitude, java.math.BigDecimal longitude,
                            String locationDetail, String deviceInfo, String device, String browser,
                            String location, String ipSource) {
        LoginLog loginLog = new LoginLog();
        loginLog.setUserId(userId);
        loginLog.setIp(ip);
        loginLog.setIpAddress(ipAddress);
        loginLog.setCountry(country);
        loginLog.setProvince(province);
        loginLog.setCity(city);
        loginLog.setLatitude(latitude);
        loginLog.setLongitude(longitude);
        loginLog.setLocationDetail(locationDetail);
        loginLog.setDeviceInfo(deviceInfo);
        loginLog.setDevice(device != null ? device : "未知设备");
        loginLog.setBrowser(browser != null ? browser : "未知浏览器");
        loginLog.setLocation(location);
        loginLog.setIpSource(ipSource);
        loginLogMapper.insert(loginLog);
    }

    @Override
    public PageResult<LoginLogVO> list(LoginLogQueryDTO queryDTO) {
        Page<LoginLog> page = PageUtil.buildPage(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<LoginLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LoginLog::getDeleted, 0);

        if (queryDTO.getUserId() != null) {
            wrapper.eq(LoginLog::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getIp() != null && !queryDTO.getIp().isEmpty()) {
            wrapper.like(LoginLog::getIp, queryDTO.getIp());
        }
        if (queryDTO.getCountry() != null && !queryDTO.getCountry().isEmpty()) {
            wrapper.eq(LoginLog::getCountry, queryDTO.getCountry());
        }
        if (queryDTO.getProvince() != null && !queryDTO.getProvince().isEmpty()) {
            wrapper.eq(LoginLog::getProvince, queryDTO.getProvince());
        }
        if (queryDTO.getCity() != null && !queryDTO.getCity().isEmpty()) {
            wrapper.eq(LoginLog::getCity, queryDTO.getCity());
        }

        wrapper.orderByDesc(LoginLog::getCreateTime);

        Page<LoginLog> result = loginLogMapper.selectPage(page, wrapper);
        List<LoginLogVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return PageUtil.buildPageResult(result, voList);
    }

    @Override
    public LoginLogVO getById(Long id) {
        LoginLog loginLog = loginLogMapper.selectById(id);
        if (loginLog == null || loginLog.getDeleted() == 1) {
            return null;
        }
        return convertToVO(loginLog);
    }

    @Override
    public void delete(Long id) {
        LoginLog loginLog = loginLogMapper.selectById(id);
        if (loginLog != null && loginLog.getDeleted() == 0) {
            loginLogMapper.deleteById(id);
        }
    }

    private LoginLogVO convertToVO(LoginLog loginLog) {
        LoginLogVO vo = BeanUtil.copyProperties(loginLog, LoginLogVO.class);
        if (loginLog.getUserId() != null) {
            User user = userMapper.selectById(loginLog.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
            }
        }
        return vo;
    }
}

