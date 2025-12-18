package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class LoginLogQueryDTO extends BaseDTO {
    private Long userId;

    private String ip;

    private String country;

    private String province;

    private String city;
}

