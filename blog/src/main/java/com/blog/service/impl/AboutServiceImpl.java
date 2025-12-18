package com.blog.service.impl;

import com.blog.model.dto.AboutDTO;
import com.blog.model.vo.AboutVO;
import com.blog.model.vo.ConfigVO;
import com.blog.service.AboutService;
import com.blog.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AboutServiceImpl implements AboutService {
    private static final String ABOUT_CONFIG_KEY = "about.content";

    @Autowired
    private ConfigService configService;

    @Override
    public AboutVO getAbout() {
        ConfigVO config = configService.getByKey(ABOUT_CONFIG_KEY);
        if (config == null) {
            AboutVO vo = new AboutVO();
            vo.setContent("");
            return vo;
        }
        AboutVO vo = new AboutVO();
        vo.setContent(config.getValue());
        return vo;
    }

    @Override
    @Transactional
    public void updateAbout(AboutDTO dto) {
        configService.updateByKey(ABOUT_CONFIG_KEY, dto.getContent());
    }
}

