package com.blog.modules.content.about.service;



import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.modules.content.about.model.dto.AboutDTO;
import com.blog.modules.content.about.model.vo.AboutVO;
import com.blog.modules.system.config.model.vo.ConfigVO;
import com.blog.modules.content.about.service.AboutService;
import com.blog.modules.system.config.service.ConfigService;
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
        com.blog.modules.system.config.model.vo.ConfigVO existingConfig = configService.getByKey(ABOUT_CONFIG_KEY);

        if (existingConfig == null) {
            // 创建新配置
            com.blog.modules.system.config.model.dto.ConfigDTO configDTO = new com.blog.modules.system.config.model.dto.ConfigDTO();
            configDTO.setConfigKey(ABOUT_CONFIG_KEY);
            configDTO.setName("关于页面内容");
            configDTO.setValue(dto.getContent());
            configDTO.setGroupName("content");
            configDTO.setType("text");
            configService.create(configDTO);
        } else {
            // 更新现有配置
            com.blog.modules.system.config.model.dto.ConfigDTO configDTO = new com.blog.modules.system.config.model.dto.ConfigDTO();
            configDTO.setValue(dto.getContent());
            configService.updateByKey(ABOUT_CONFIG_KEY, configDTO);
        }
    }
}

