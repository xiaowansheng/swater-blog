import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Popover, Input, Button, Tag, Empty, InputRef } from 'antd';
import { PlusOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { Category } from '@/types';

interface CategorySelectorProps {
  value?: number | string;
  onChange?: (value: number | string | undefined) => void;
  categories: Category[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange, categories }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const selectedCategory = useMemo(() => {
    if (!value) return null;
    return categories.find(c => c.id === value) || { id: value, name: value as string };
  }, [value, categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  const handleSelect = (category: Category | string) => {
    if (typeof category === 'string') {
      onChange?.(category);
    } else {
      onChange?.(category.id);
    }
    setOpen(false);
    setSearchText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      const exactMatch = categories.find(c => c.name.toLowerCase() === searchText.toLowerCase());
      handleSelect(exactMatch || searchText.trim());
    }
  };

  const content = (
    <div className="w-64">
      <Input
        ref={inputRef}
        placeholder="搜索或输入新分类..."
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-2"
        autoFocus
      />
      <div className="max-h-60 overflow-y-auto">
        {filteredCategories.length > 0 ? (
          <div className="flex flex-col gap-1">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className={`px-3 py-2 cursor-pointer rounded-md flex justify-between items-center transition-colors ${
                  value === cat.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSelect(cat)}
              >
                <span>{cat.name}</span>
                {value === cat.id && <CheckOutlined className="text-xs" />}
              </div>
            ))}
          </div>
        ) : searchText ? (
          <div 
            className="px-3 py-4 text-center cursor-pointer hover:bg-gray-100 rounded-md text-blue-600"
            onClick={() => handleSelect(searchText)}
          >
            <PlusOutlined className="mr-1" />
            新增分类: "{searchText}"
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分类" />
        )}
      </div>
    </div>
  );

  if (selectedCategory) {
    return (
      <Tag
        closable
        onClose={() => onChange?.(undefined)}
        className="px-3 py-1 text-sm bg-blue-50 border-blue-200 text-blue-600 flex items-center w-fit cursor-default"
      >
        {selectedCategory.name}
      </Tag>
    );
  }

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      overlayClassName="category-selector-popover"
    >
      <Button icon={<PlusOutlined />} className="rounded-full">
        选择分类
      </Button>
    </Popover>
  );
};

export default CategorySelector;
