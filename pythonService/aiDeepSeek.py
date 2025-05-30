import requests
import json

# 替换为你的 Deepseek API Key
API_KEY = "sk-9faf043a824c4b109f1869066cf0903b"

# Deepseek API Endpoint (根据你的需求选择正确的 endpoint)
API_URL = "https://api.deepseek.com/v1/chat/completions"  # Chat Completion endpoint
# 如果使用embeddings endpoint，替换成如下
# API_URL = "https://api.deepseek.com/v1/embeddings"

# 请求头
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

def chat_with_deepseek(prompt, model_name="deepseek-chat"):  #model_name可以根据需要修改
    """
    与 Deepseek 模型进行对话。

    Args:
        prompt (str): 用户输入的问题或指令。
        model_name (str): 模型名称。  Defaults to "deepseek-chat".

    Returns:
        str: 模型的回复。  如果出现错误，返回错误信息。
    """

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7  # 可选参数，控制生成文本的随机性
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, data=json.dumps(payload))
        response.raise_for_status()  # 检查请求是否成功 (200 OK)

        response_json = response.json()

        # 提取模型的回复
        if 'choices' in response_json and len(response_json['choices']) > 0:
            return response_json['choices'][0]['message']['content']
        else:
            return f"Error: Unexpected response format: {response_json}"

    except requests.exceptions.RequestException as e:
        return f"Error: API request failed: {e}"
    except json.JSONDecodeError as e:
        return f"Error: Failed to decode JSON response: {e} - {response.text}"  # 打印原始响应内容
    except Exception as e:
        return f"An unexpected error occurred: {e}"


def create_embedding(text, model_name="deepseek-embedding"):
    """
    Create an embedding for the given text.
    Args:
        text (str): The text to embed.
        model_name (str): The model name. Defaults to "deepseek-embedding".

    Returns:
        list: The embedding vector. If an error occurred, returns an error message.
    """

    payload = {
        "model": model_name,
        "input": text
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, data=json.dumps(payload))
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        response_json = response.json()

        if 'data' in response_json and len(response_json['data']) > 0:
            return response_json['data'][0]['embedding']
        else:
            return f"Error: Unexpected response format: {response_json}"

    except requests.exceptions.RequestException as e:
        return f"Error: API request failed: {e}"
    except json.JSONDecodeError as e:
        return f"Error: Failed to decode JSON response: {e} - {response.text}"  # Print raw response content
    except Exception as e:
        return f"An unexpected error occurred: {e}"

# 示例用法
if __name__ == "__main__":
    user_prompt = "请介绍一下你自己。" # 你的问题
    model_response = chat_with_deepseek(user_prompt)

    if model_response.startswith("Error:"):
        print(f"调用 Deepseek API 时出错: {model_response}")
    else:
        print(f"Deepseek 的回复: {model_response}")

    text_to_embed = "Hello, world!"
    embedding = create_embedding(text_to_embed)
    if isinstance(embedding, str) and embedding.startswith("Error:"):
        print(f"Error creating embedding: {embedding}")
    else:
        print(f"Embedding for '{text_to_embed}': {embedding[:10]}... (truncated)")  # 只打印前10个元素