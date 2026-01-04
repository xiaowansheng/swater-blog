package com.blog.modules.content.about.service;


import com.blog.modules.content.about.model.dto.AboutDTO;
import com.blog.modules.content.about.model.vo.AboutVO;
public interface AboutService {
    AboutVO getAbout();

    void updateAbout(AboutDTO dto);
}

