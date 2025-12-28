import React, { useState, useMemo } from 'react';
import { Popover, Input, Button, Tag, Space, Empty, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { Tag as TagType } from '@/types';

interface TagSelectorProps {
  value?: (number | string)[];
  onChange?: (value: (number | string)[]) => void;
  tags: TagType[];
  maxCount?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value = [], onChange, tags, maxCount = 10 }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedTags = useMemo(() => {
    return value.map(v => {
      const existing = tags.find(t => t.id === v);
      return existing || { id: v, name: v as string };
    });
  }, [value, tags]);

  const filteredTags = useMemo(() => {
    return tags.filter(t => 
      t.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [tags, searchText]);

  const toggleTag = (tag: TagType | string) => {
    const tagName = typeof tag === 'string' ? tag : tag.name;
    const tagId = typeof tag === 'string' ? tag : tag.id;
    
    const isSelected = value.some(v => v === tagId);
    let newValue: (number | string)[];

    if (isSelected) {
      newValue = value.filter(v => v !== tagId);
    } else {
      if (value.length >= maxCount) return;
      newValue = [...value, tagId];
    }

    onChange?.(newValue);
    
    // 如果选满了，自动关闭
    if (!isSelected && newValue.length >= maxCount) {
      setOpen(false);
      setSearchText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      const exactMatch = tags.find(t => t.name.toLowerCase() === searchText.toLowerCase());
      const target = exactMatch || searchText.trim();
      const targetId = typeof target === 'string' ? target : target.id;
      
      if (!value.includes(targetId)) {
        toggleTag(target);
      }
      setSearchText('');
    }
  };

  const content = (
    <div className="w-72">
      <Input
        placeholder="搜索或输入新标签..."
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-3"
        autoFocus
      />
      <div className="max-h-60 overflow-y-auto">
        <div className="flex flex-wrap gap-2 p-1">
          {filteredTags.map(tag => {
            const isSelected = value.includes(tag.id);
            return (
              <Tag
                key={tag.id}
                className={`cursor-pointer px-3 py-1 transition-all ${
                  isSelected 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag.name}
              </Tag>
            );
          })}
          {searchText && !tags.some(t => t.name.toLowerCase() === searchText.toLowerCase()) && (
            <Tag
              className="cursor-pointer px-3 py-1 bg-blue-50 text-blue-600 border-blue-200 border-dashed"
              onClick={() => toggleTag(searchText)}
            >
              <PlusOutlined className="mr-1" />
              新增: {searchText}
            </Tag>
          )}
        </div>
        {!searchText && filteredTags.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无标签" />
        )}
      </div>
      <div className="mt-3 pt-2 border-t text-xs text-gray-400 flex justify-between items-center">
        <span>已选 {value.length} / {maxCount}</span>
        {value.length > 0 && (
          <Button type="link" size="small" onClick={() => onChange?.([])} className="h-auto p-0 text-xs">
            清除全部
          </Button>
        )}
      </div>
    </div>
  );

  const displayTags = selectedTags.slice(0, 3);
  const remainingCount = selectedTags.length - 3;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayTags.map(tag => (
        <Tag
          key={tag.id}
          closable
          onClose={() => toggleTag(typeof tag.id === 'number' ? tags.find(t => t.id === tag.id)! : tag.name)}
          className="px-3 py-1 bg-blue-50 border-blue-200 text-blue-600 flex items-center"
        >
          {tag.name}
        </Tag>
      ))}
      {remainingCount > 0 && (
        <Tooltip title={selectedTags.slice(3).map(t => t.name).join(', ')}>
          <Tag className="px-2 py-1 bg-gray-50 text-gray-500 border-gray-200">
            +{remainingCount}
          </Tag>
        </Tooltip>
      )}
      <Popover
        content={content}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
        overlayClassName="tag-selector-popover"
      >
        <Button 
          icon={<PlusOutlined />} 
          className="rounded-full"
          disabled={value.length >= maxCount}
        >
          {value.length === 0 ? '添加标签' : '继续添加'}
        </Button>
      </Popover>
    </div>
  );
};

export default TagSelector;
