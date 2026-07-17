---
title: bug记录
tags:
  - write
category:
  - write
---

<h1>bug记录</h1> 

# bug记录

* 1. [NSDateFormatter](#first)

*bug记录*

## 1. <a name='first'></a> NSDateFormatter

err Code:
     
    NSString *endTime = [[NSString alloc] initWithData:[NSString hexStringToBytes:[dkInfo substringWithRange:NSMakeRange(44, 32)]] encoding:NSUTF8StringEncoding]; 
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyyMMdd'T'HHmmss'Z'"];
    NSDate *endDate = [dateFormatter dateFromString:endTime]; 
现象：
    ios用户设置时间显示为十二进制的时候这个dateFromString会返回nil，二十四进制正常。


原因：
    NSDateFormatter 底层依赖 ICU（International Components for Unicode）库。这个库强制关联了系统“设置->通用->日期与时间->24小时制”的开关。
    在我这里没有设置locale的情况下它识别到>12h且没am和pm标识就会空指针。
    怎么解决呢？描述里有这一段：
```
    When working with fixed format dates, such as RFC 3339, you set the dateFormat property to specify a format string. For most fixed formats, you should also set the locale property to a POSIX locale ("en_US_POSIX"), and set the timeZone property to UTC.
```
加上dateFormatter.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"];就行了 或者直接切换为ISO8601DateFormatter来处理格式化的问题。


吐槽：
    有点反直觉。。。

总结：
    参考代码别看太老的文章，用到的方法最好去官网查一下。