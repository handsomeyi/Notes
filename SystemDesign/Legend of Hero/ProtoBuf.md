# Protobuf 协议文档

不用WebSocket



必须先定义消息文件==GameMsgProtocol.proto== **数据就传数字就行了** 然后客户端和服务端各自查表

```protobuf
syntax = “proto3”;
package msg;
option java_package - "org.tinygame.herostory.msg"
enum MsgCode {
	......
	USER_ATTK_CMD = 9;
	USER_ATTK_RESULT = 10;
	......
}
message UserEntryCmd {
    uint32 userId = 1;    // 用户 Id
    string heroAvatar = 2;    // 英雄形象
}
message UserEntryResult {
    uint32 userId = 1;    // 用户 Id
    string heroAvatar = 2;    // 英雄形象
}
    消息命名规则是 XxxCmd 和 XxxResult；
    XxxCmd 代表客户端发往服务器的消息；
    XxxResult 代表服务器返回给客户端的消息；
    UserEntryCmd；
    UserEntryResult；
    ......
```

# 使用方法



```protobuf
syntax = "proto3";
package msg;
option java_package = "org.tinygame.herostory.msg";
// 消息代号
enum MsgCode {
    USER_ENTRY_CMD = 0;
    USER_ENTRY_RESULT = 1;
    WHO_ELSE_IS_HERE_CMD = 2; // 还有谁在这儿呀?
    WHO_ELSE_IS_HERE_RESULT = 3; // 有这些人: 2, 3, 4, 5...
    USER_MOVE_TO_CMD = 4;
    USER_MOVE_TO_RESULT = 5;
    USER_QUIT_RESULT = 6;
    USER_STOP_CMD = 7;
    USER_STOP_RESULT = 8;
    USER_ATTK_CMD = 9;
    USER_ATTK_RESULT = 10;
    USER_SUBTRACT_HP_RESULT = 11;
    USER_DIE_RESULT = 12;
};
// 用户入场
///////////////////////////////////////////////////////////////////////
// 指令
message UserEntryCmd {
    // 用户 Id
    uint32 userId = 1;
    // 英雄形象
    string heroAvatar = 2;
}
// 结果
message UserEntryResult {
    // 用户 Id
    uint32 userId = 1;
    // 英雄形象
    string heroAvatar = 2;
}
//
// 还有谁在场
///////////////////////////////////////////////////////////////////////
// 指令
message WhoElseIsHereCmd {
}
// 结果
message WhoElseIsHereResult {
    // 用户信息数组
    repeated UserInfo userInfo = 1;

    // 用户信息
    message UserInfo {
        // 用户 Id
        uint32 userId = 1;
        // 英雄形象
        string heroAvatar = 2;
    }
}
// 用户移动
///////////////////////////////////////////////////////////////////////
// 指令
message UserMoveToCmd {
    // 
    // XXX 注意: 用户移动指令中没有用户 Id,
    // 这是为什么?
    // 
    // 移动到位置 X
    float moveToPosX = 1;
    // 移动到位置 Y
    float moveToPosY = 2;
}
// 结果
message UserMoveToResult {
    // 移动用户 Id
    uint32 moveUserId = 1;
    // 移动到位置 X
    float moveToPosX = 2;
    // 移动到位置 Y
    float moveToPosY = 3;
}
// 用户退场
///////////////////////////////////////////////////////////////////////
// 
// XXX 注意: 用户退场不需要指令, 因为是在断开服务器的时候执行
// 
// 结果
message UserQuitResult {
    // 退出用户 Id
    uint32 quitUserId = 1;
}
// 用户停驻
///////////////////////////////////////////////////////////////////////
// 指令
message UserStopCmd {
}
// 结果
message UserStopResult {
    // 停驻用户 Id
    uint32 stopUserId = 1;
    // 停驻在位置 X
    float stopAtPosX = 2;
    // 停驻在位置 Y
    float stopAtPosY = 3;
}
// 用户攻击
///////////////////////////////////////////////////////////////////////
// 指令
message UserAttkCmd {
    // 目标用户 Id
    uint32 targetUserId = 1;
}
// 结果
message UserAttkResult {
    // 发动攻击的用户 Id
    uint32 attkUserId = 1;
    // 目标用户 Id
    uint32 targetUserId = 2;
}
// 用户减血结果
message UserSubtractHpResult {
    // 目标用户 Id
    uint32 targetUserId = 1;
    // 减血量
    uint32 subtractHp = 2;
}
// 死亡结果
message UserDieResult {
    // 目标用户 Id
    uint32 targetUserId = 1;
}

```





