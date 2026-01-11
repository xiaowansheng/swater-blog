package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

import java.util.List;

@Data
public class AdminStatisticsTrendVO {
    private String metric;
    private List<AdminStatisticsTrendPointVO> points;
}

