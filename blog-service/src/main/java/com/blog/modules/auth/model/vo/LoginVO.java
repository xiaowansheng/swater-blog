package com.blog.modules.auth.model.vo;



import com.blog.modules.user.model.vo.UserVO;
import lombok.Data;
@Data
public class LoginVO {
    private String token;

    private UserVO user;
}

