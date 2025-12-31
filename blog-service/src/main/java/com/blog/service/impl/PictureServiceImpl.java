package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.context.UserContext;
import com.blog.exception.BusinessException;
import com.blog.mapper.AlbumMapper;
import com.blog.mapper.PictureMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.PictureDTO;
import com.blog.model.entity.Album;
import com.blog.model.entity.Picture;
import com.blog.model.entity.User;
import com.blog.model.vo.PictureVO;
import com.blog.service.PictureService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PictureServiceImpl implements PictureService {
    @Autowired
    private PictureMapper pictureMapper;

    @Autowired
    private AlbumMapper albumMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<PictureVO> list(Long page, Long size, Long albumId) {
        Page<Picture> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Picture> wrapper = new LambdaQueryWrapper<>();

        if (albumId != null) {
            wrapper.eq(Picture::getAlbumId, albumId);
        }

        wrapper.orderByDesc(Picture::getCreateTime);

        Page<Picture> result = pictureMapper.selectPage(pageParam, wrapper);
        List<PictureVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public PictureVO getById(Long id) {
        Picture picture = pictureMapper.selectById(id);
        if (picture == null) {
            return null;
        }
        return convertToVO(picture);
    }

    @Override
    @Transactional
    public Long create(PictureDTO dto) {
        Album album = albumMapper.selectById(dto.getAlbumId());
        if (album == null) {
            throw new BusinessException("相册不存在");
        }

        Picture picture = BeanUtil.copyProperties(dto, Picture.class);

        if (UserContext.isLoggedIn()) {
            picture.setUserId(UserContext.getCurrentUserId());
        }

        if (picture.getStatus() == null || picture.getStatus().isEmpty()) {
            picture.setStatus("1");
        }

        pictureMapper.insert(picture);

        if (album.getCover() == null || album.getCover().isEmpty()) {
            album.setCover(picture.getUrl());
            albumMapper.updateById(album);
        }

        return picture.getId();
    }

    @Override
    @Transactional
    public void update(Long id, PictureDTO dto) {
        Picture picture = pictureMapper.selectById(id);
        if (picture == null) {
            throw new BusinessException("图片不存在");
        }

        if (dto.getAlbumId() != null && !dto.getAlbumId().equals(picture.getAlbumId())) {
            Album album = albumMapper.selectById(dto.getAlbumId());
            if (album == null) {
                throw new BusinessException("相册不存在");
            }
        }

        BeanUtils.copyProperties(dto, picture);
        pictureMapper.updateById(picture);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Picture picture = pictureMapper.selectById(id);
        if (picture == null) {
            throw new BusinessException("图片不存在");
        }
        pictureMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void moveToAlbum(Long id, Long albumId) {
        Picture picture = pictureMapper.selectById(id);
        if (picture == null) {
            throw new BusinessException("图片不存在");
        }

        Album album = albumMapper.selectById(albumId);
        if (album == null) {
            throw new BusinessException("相册不存在");
        }

        picture.setAlbumId(albumId);
        pictureMapper.updateById(picture);
    }

    private PictureVO convertToVO(Picture picture) {
        PictureVO vo = BeanUtil.copyProperties(picture, PictureVO.class);
        if (picture.getUserId() != null) {
            User user = userMapper.selectById(picture.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
            }
        }
        if (picture.getAlbumId() != null) {
            Album album = albumMapper.selectById(picture.getAlbumId());
            if (album != null) {
                vo.setAlbumName(album.getName());
            }
        }
        return vo;
    }
}

