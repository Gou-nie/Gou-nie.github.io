import os
import re
from datetime import datetime

def rename_files_from_timestamp(directory):
    # 遍历目录中的所有文件
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            # 使用正则表达式匹配时间戳
            match = re.search(r'(\d{10,13})', filename)
            if match:
                timestamp_str = match.group(1)
                # 处理不同长度的时间戳
                if len(timestamp_str) == 10:
                    timestamp = int(timestamp_str)
                elif len(timestamp_str) == 13:
                    timestamp = int(timestamp_str) // 1000
                else:
                    continue
                # 将时间戳转换为日期时间对象
                dt = datetime.fromtimestamp(timestamp)
                new_date_str = dt.strftime('%Y-%m-%d_%H%M%S')
                # 构建新的文件名
                new_filename = re.sub(r'(\d{10,13})', new_date_str, filename)
                new_file_path = os.path.join(directory, new_filename)
                # 重命名文件
                try:
                    os.rename(file_path, new_file_path)
                    print(f"已将 {filename} 重命名为 {new_filename}")
                except Exception as e:
                    print(f"重命名 {filename} 时出错: {e}")

if __name__ == "__main__":
    # 指定要处理的目录，这里使用当前工作目录
    target_directory = './md/.vuepress/public/images/draw'
    rename_files_from_timestamp(target_directory)