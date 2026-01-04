package com.blog.common.model.dto;


import lombok.Data;
import java.io.Serializable;
@Data
public class BaseDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long current;

    private Long size;
}

