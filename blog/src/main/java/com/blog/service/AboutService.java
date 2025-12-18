package com.blog.service;

import com.blog.model.dto.AboutDTO;
import com.blog.model.vo.AboutVO;

public interface AboutService {
    AboutVO getAbout();

    void updateAbout(AboutDTO dto);
}

