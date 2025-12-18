package com.blog.service.impl;

import com.blog.model.vo.AboutVO;
import com.blog.model.vo.ConfigVO;
import com.blog.service.AboutPublicService;
import com.blog.service.ConfigPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AboutPublicServiceImpl implements AboutPublicService {
    private static final String ABOUT_CONFIG_KEY = "about.content";

    @Autowired
    private ConfigPublicService configPublicService;

    @Override
    public AboutVO getAbout() {
        ConfigVO config = configPublicService.getByKey(ABOUT_CONFIG_KEY);
        if (config == null) {
            AboutVO vo = new AboutVO();
            vo.setContent("");
            return vo;
        }
        AboutVO vo = new AboutVO();
        vo.setContent(config.getValue());
        return vo;
    }
}

