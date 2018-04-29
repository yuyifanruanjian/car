// car
package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode struct {
}

//用户
type User struct {
	Name              string   `json:"name"`          //用户名称
	Passwd            string   `json:"passwd"`        //密码
	PhonNumber        string   `json:"phoneNumber"`   //电话号码
	Score             float64  `json:"score"`         //信用分值
	CarID             []string `json:"carId"`         //车牌号
	PhotoID           []int    `json:"photoId"`       //提交图片ID
	QuestionID        []int    `json:"questionId"`    //提出问题ID
	BookID            []int    `json:"bookId"`        //教程ID
	ArbitrationID     []int    `json:"arbitrationId"` //仲裁ID
	ID                int      `json:"id"`            //用户ID
}

//图片
type Photo struct {
	Url    string `json:"url"`    //图片
	Time   string `json:"time"`   //提交时间
	CarID  string `json:"carId"`  //车牌号
	UserID int    `json:"userid"` //提交者ID
	ID     int    `json:"id"`     //图片ID
}

//教程
type Book struct {
	Name    string  `json:"name"`    //教程名称
	Address string  `json:"address"` //教程地址
	Score   float64 `json:"score"`   //教程价格
	Time    string  `json:"time"`    //提交时间
	UserID  int     `json:"userId"`  //提交者ID
	ID      int     `json:"id"`      //教程ID
}

//问题
type Question struct {
	Content   string         `json:"content"`   //问题内容
	StartTime string         `json:"startTime"` //问题提出时间
	EndTime   string         `json:"endTime"`   //问题截止时间
	Score     float64        `json:"score"`     //悬赏分值
	Answers   map[int]Answer `json:"answers"`   //回复列表
	UserID    int            `json:"userId"`    //提出者ID
	ID        int            `json:"id"`        //问题ID
}

//回复
type Answer struct {
	Content    string         `json:"content"`   //回复内容
	AnswerTime string         `json:"startTime"` //回复时间
	Score      float64        `json:"score"`     //获取分值
	AnswerID   int            `json:"answerId"`  //回复的回复ID
	ParentID   int            `json:"parentId"`  //父级回复ID
	UserID     int            `json:"userId"`    //回复者ID
	ID         int            `json:"id"`        //回复ID
}

//仲裁
type Arbitration struct {
    StartTime    string    `json:"startTime"`   //仲裁提出时间
	EndTime      string    `json:"endTime"`     //仲裁截止时间
	QuestionID   int       `json:"questionId"`  //问题ID
	AnswerID     []int     `json:"answerId"`    //回答ID
}


var PhotoList map[int]Photo

var BookList map[int]Book

var QuestionList map[int]Question

var AnswerList map[int][]Answer

var ArbitrationList map[int]Arbitration

//Init
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("service Init")
	_, args := stub.GetFunctionAndParameters()

	fmt.Printf(" init success \n")
	return shim.Success(nil)
}

//CreateUser
func (t *SimpleChaincode) CreateUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("CreateUser")

	var name string       //用户名称
	var passwd string     //密码
	var phonNumber string //电话号码
	var score float64     //信用分值
	var carId []string    //车牌号
	var id int            //用户ID

	var user User
	var err error

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	name = args[0]

	passwd = args[1]

	phonNumber = args[2]

	score = 0

	carId = args[3]

	id, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	fmt.Printf(" Name = %s, PhonNumber  = %s, Score =%f, CarId =%d, ID =%d\n", name, phonNumber, score, carId, id)

	user.Name = name
	user.Passwd = passwd
	user.PhonNumber = phonNumber
	user.Score = score
	user.CarID = carId
	user.ID = id

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[4], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("CreateUser success \n")
	return shim.Success(nil)
}

//GetUser
func (t *SimpleChaincode) GetUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("GetUser")

	var id int //用户ID
	var user User
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	id = args[0]

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}
	user.Passwd = ""
	fmt.Printf(" Name = %s, PhonNumber  = %s, Score = %f, CarId = %d, ID = %d\n", user.Name, user.PhonNumber, user.Score, user.CarID, user.ID)

	return shim.Success(nil)
}

//SetUser
func (t *SimpleChaincode) SetUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("SetUser")

	var name string       //用户名称
	var passwd string     //密码
	var phonNumber string //电话号码
	var carId []string    //车牌号
	var id int            //用户ID
	var user User
	var err error

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	name = args[0]

	passwd = args[1]

	phonNumber = args[2]

	carId = args[3]

	id, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, PhonNumber  = %s, Score =%f, CarId =%d, ID =%d\n", name, phonNumber, user.Score, carId, id)

	user.Name = name
	user.Passwd = passwd
	user.PhonNumber = phonNumber
	user.CarID = carId
	user.ID = id

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[4], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("SetUser success \n")
	return shim.Success(nil)
}

//SubmitPhoto
func (t *SimpleChaincode) SubmitPhoto(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("SubmitPhoto")

	var id int            //用户ID
	var submitTime string //提交时间
	var url string        //图片地址
	var carId string      //车牌号
	var photoId int       //图片ID
	var user User
	var photo Photo
	var err error

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	submitTime = args[1]

	url = args[2]

	carId = args[3]

	photoId, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)

	user.Score = user.Score + 2
	user.PhotoID = append(user.PhotoID, photoId)

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}

	photo.Url = url
	photo.Time = submitTime
	photo.UserID = id
	photo.ID = photoId
	photo.CarID = carId

	PhotoList[photoId] = photo

	fmt.Printf("SubmitPhoto success \n")
	return shim.Success(nil)
}

//RecivePunishmentOrAward
func (t *SimpleChaincode) RecivePunishmentOrAward(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("RecivePunishmentOrAward")

	var id int       //用户ID
	var wayType int  //行为类型，0为违章，1为良好
	var carId string //车牌号
	var wayLevel int //行为严重程度，违章时越高减分越多，良好时加分越多
	var score float64
	var user User
	var err error

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	wayType, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：WayType ")
	}

	carId = args[2]

	wayLevel, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：WayLevel ")
	}

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)

    if wayType == 0 {
		switch wayLevel:
		case 0: score = 1
		case 1: score = 2
		case 2: score = 3
		default: score = 1
	} else {
		switch wayLevel:
		case 0: score = 1
		case 1: score = 2
		case 2: score = 3
		default: score = 1
	}

	user.Score = user.Score + score

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("RecivePunishmentOrAward success \n")
	return shim.Success(nil)
}

//SubmitBook
func (t *SimpleChaincode) SubmitBook(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("SubmitBook")

	var id int            //用户ID
	var name string       //教程名称
	var submitTime string //提交时间
	var address string    //图片地址
	var score float64     //指定分数
	var bookId int        //教程ID
	var user User
	var book Book
	var err error

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	name = args[1]
	
	submitTime = args[2]

	address = args[3]

	score, err = strconv.ParseFloat(args[4], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：Score ")
	}

	bookId, err = strconv.Atoi(args[5])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)

	user.BookID = append(user.BookID, bookId)

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}

    book.UserID = id
	book.ID = bookId
	book.Name = name
	book.Time = submitTime
	book.Address = address
	book.Score = score

	BookList[bookId] = book

	fmt.Printf("SubmitBook success \n")
	return shim.Success(nil)
}

//GetBookList
func (t *SimpleChaincode) GetBookList(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("GetBookList")

	fmt.Printf(" BookList = %d\n", BookList)

	fmt.Printf("GetBookList success \n")
	return shim.Success(nil)
}

//BuyBook
func (t *SimpleChaincode) BuyBook(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("BuyBook")

	var bookId int    // 教程ID
	var fromId int    //付款方ID
	var toId int      //接收方ID
	var score float64 //转账金额
	var book Book
	var fromUser User
	var toUser User
	var err error

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	
	bookId, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：BookID  ")
	}
	
	fromId, err = strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：FromID  ")
	}
	
	book = BookList[bookId]
	
	toId = book.UserID
	
	score = book.Score

	fromIDString := strconv.Itoa(fromId)
	fromUserInfoBytes, erro := stub.GetState(fromIDString)
	if erro != nil {
		return shim.Error(erro.Error())
	}

	//将byte的结果转换成struct

	err = json.Unmarshal(fromUserInfoBytes, &fromUser)

	fmt.Printf("  fromUserInfoBytes  = %d  \n", fromUserInfoBytes)

	toIDString := strconv.Itoa(toId)
	toUserInfoBytes, erro1 := stub.GetState(toIDString)
	if erro1 != nil {
		return shim.Error(erro1.Error())
	}

	//将byte的结果转换成struct

	err = json.Unmarshal(toUserInfoBytes, &toUser)

	fmt.Printf("  toUserInfoBytes  = %d  \n", toUserInfoBytes)

	fromUserOldScore := fromUser.Score
	if fromUserOldScore <= score {
		return shim.Error("score no enough")
	}

	fromUser.Score = fromUserOldScore - score

	toUser.Score = toUser.Score + score

	jsonsFrom, errs := json.Marshal(fromUser) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}
	// Write the state to the ledger
	err = stub.PutState(fromIDString, jsonsFrom)
	if err != nil {
		return shim.Error(err.Error())
	}

	jsonsTo, errs2 := json.Marshal(toUser) //转换成JSON返回的是byte[]
	if errs2 != nil {
		return shim.Error(errs2.Error())
	}
	// Write the state to the ledger
	err = stub.PutState(toIDString, jsonsTo)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("BuyBook success \n")
	return shim.Success(nil)
}

//SubmitQuestion
func (t *SimpleChaincode) SubmitQuestion(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("SubmitQuestion")

	var id int            //用户ID
	var content string    //问题内容
	var startTime string  //问题提出时间
	var endTime string    //问题截止时间
	var score float64     //指定分数
	var questionId int    //问题ID
	var user User
	var question Question
	var err error

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	content = args[1]
	
	startTime = args[2]

	endTime = args[3]

	score, err = strconv.ParseFloat(args[4], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：Score ")
	}

	questionId, err = strconv.Atoi(args[5])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}

	userByte, erro := stub.GetState(id)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)
	
	oldScore := user.Score
	if oldScore < score {
		return shim.Error("score no enough")
	}
	
	user.QuestionID = append(user.QuestionID, questionId)
	user.Score = user.Score - score

	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}

    question.ID = questionId
	question.UserID = id
	question.Content = content
	question.StartTime = startTime
	question.EndTime = endTime
	question.Score = score

	QuestionList[questionId] = question

	fmt.Printf("SubmitQuestion success \n")
	return shim.Success(nil)
}

//AnswerQuestion
func (t *SimpleChaincode) AnswerQuestion(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("AnswerQuestion")

	var id int            //用户ID
	var content string    //回复内容
	var answerTime string //回复时间
	var score float64     //获取分数
	var questionId int    //问题ID
	var answerId int      //回复ID
	var question Question
	var answer Answer
	var err error
	

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	content = args[1]
	
	answerTime = args[2]
	
	score = 0

	questionId, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：QuestionID ")
	}

    answerId, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：AnswerID ")
	}
	
	question = QuestionList[questionId]
	
	answer.AnswerTime = answerTime
	answer.Content = content
	answer.ID = answerId
	answer.UserID = id
	answer.AnswerID = 0
	answer.ParentID = 0
	answer.Score = score
	
	question.Answers[answerId] = answer
	QuestionList[questionId] = question

	fmt.Printf("AnswerQuestion success \n")
	return shim.Success(nil)
}

//Reply
func (t *SimpleChaincode) Reply(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("Reply")

	var id int            //用户ID
	var content string    //回复内容
	var answerTime string //回复时间
	var score float64     //获取分数
	var answerId int      //回复ID
	var replyId int       //回复的回复ID
	var parentId int      //父回复ID
	var answer Answer
	var err error
	

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	content = args[1]
	
	answerTime = args[2]
	
	score = 0

    answerId, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ID ")
	}
	
	replyId, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：AnswerID ")
	}
	
	parentId, err = strconv.Atoi(args[5])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：ParentID ")
	}
	
	answer.AnswerTime = answerTime
	answer.Content = content
	answer.ID = answerId
	answer.UserID = id
	answer.AnswerID = replyId
	answer.ParentID = parentId
	answer.Score = score
	
	AnswerList[parentId] = append(AnswerList[parentId], answer)

	fmt.Printf("Reply success \n")
	return shim.Success(nil)
}

//DistributeScore
func (t *SimpleChaincode) DistributeScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("DistributeScore")

	var id int            //用户ID
	var score float64     //获取分数
	var questionId int    //问题ID
	var answerId int      //回答ID
	var question Question
	var answer Answer
	var user User
	var err error
	

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}

	score, err = strconv.ParseFloat(args[1], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：Score ")
	}
	
	questionId, err = strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：QuestionID ")
	}
    
	answerId, err = strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：AnswerID ")
	}
	
	question = QuestionList[questionId]
	answer = question.Answers[answerId]
	
	if score > question.Score {
		return shim.Error("score no enough ")
	}
	
	answer.Score = score
	
	userByte, erro := stub.GetState(answer.UserID)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)
	
	user.Score = user.Score + score
	
	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(strconv.Itoa(answer.UserID), jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	question.Answers[answerId] = answer
	question.Score = question.Score - score
	QuestionList[questionId] = question

	fmt.Printf("DistributeScore success \n")
	return shim.Success(nil)
}

//ReturnScore
func (t *SimpleChaincode) ReturnScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("ReturnScore")
	
	var questionId int    //问题ID
	var id int
	var question Question
	var user User
	var err error
	

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	questionId, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：QuestionID ")
	}
	
	question = QuestionList[questionId]
	
	id = question.UserID
	
	if question.Score <= 0 {
		return shim.Error("score no enough ")
	}
	
	userByte, erro := stub.GetState(strconv.Itoa(id))
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &user)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf(" Name = %s, Score = %f, ID = %d\n", user.Name, user.Score, id)
	
	user.Score = user.Score + question.Score
	
	jsons, errs := json.Marshal(user) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(strconv.Itoa(id), jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	
	question.Score = 0
	QuestionList[questionId] = question

	fmt.Printf("ReturnScore success \n")
	return shim.Success(nil)
}

//SubmitArbitration
func (t *SimpleChaincode) SubmitArbitration(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("SubmitArbitration")

	var id int            //用户ID
	var startTime string  //仲裁提出时间
	var endTime string    //仲裁截止时间
	var questionId int    //问题ID
	var answerId int      //回答ID
	var user User
	var question Question
	var arbitration Arbitration
	var err error
	var ok bool

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	id, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserID ")
	}
	
	startTime = args[1]

	endTime = args[2]

	questionId, err = strconv.ParseFloat(args[3], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：QuestionID ")
	}

	answerId, err = strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：AnswerID ")
	}

	question = QuestionList[questionId]
	
	if question.Score <= 0 {
		return shim.Error("score no enough")
	}
	
	arbitration, ok = ArbitrationList[questionId]
	arbitration.AnswerID = append(arbitration.AnswerID, answerId)
	if !ok {
		arbitration.StartTime = startTime
		arbitration.EndTime = endTime
		arbitration.QuestionID = questionId
	}

	ArbitrationList[questionId] = arbitration

	fmt.Printf("SubmitArbitration success \n")
	return shim.Success(nil)
}

//DeleteUser
func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	err := stub.DelState(args[0])
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	return shim.Success(nil)
}

//Invoke
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Invoke")
	function, args := stub.GetFunctionAndParameters()
	if function == "invoke" {
		// Make payment of X units from A to B
		return t.invoke(stub, args)
	} else if function == "delete" {
		// Deletes an entity from its state
		return t.delete(stub, args)
	} else if function == "query" {
		// the old "Query" is now implemtned in invoke
		return t.query(stub, args)
	} else if function == "CreateUser" {
		// the old "Query" is now implemtned in invoke
		return t.CreateUser(stub, args)
	} else if function == "GetUser" {
		// the old "Query" is now implemtned in invoke
		return t.GetUser(stub, args)
	} else if function == "SetUser" {
		// the old "Query" is now implemtned in invoke
		return t.SetUser(stub, args)
	} else if function == "SubmitPhoto" {
		// the old "Query" is now implemtned in invoke
		return t.SubmitPhoto(stub, args)
	} else if function == "RecivePunishmentOrAward" {
		// the old "Query" is now implemtned in invoke
		return t.RecivePunishmentOrAward(stub, args)
	} else if function == "SubmitBook" {
		// the old "Query" is now implemtned in invoke
		return t.SubmitBook(stub, args)
	} else if function == "GetBookList" {
		// the old "Query" is now implemtned in invoke
		return t.GetBookList(stub, args)
	} else if function == "BuyBook" {
		// the old "Query" is now implemtned in invoke
		return t.BuyBook(stub, args)
	} else if function == "SubmitQuestion" {
		// the old "Query" is now implemtned in invoke
		return t.SubmitQuestion(stub, args)
	} else if function == "AnswerQuestion" {
		// the old "Query" is now implemtned in invoke
		return t.AnswerQuestion(stub, args)
	} else if function == "Reply" {
		// the old "Query" is now implemtned in invoke
		return t.Reply(stub, args)
	} else if function == "DistributeScore" {
		// the old "Query" is now implemtned in invoke
		return t.DistributeScore(stub, args)
	} else if function == "ReturnScore" {
		// the old "Query" is now implemtned in invoke
		return t.ReturnScore(stub, args)
	} else if function == "SubmitArbitration" {
		// the old "Query" is now implemtned in invoke
		return t.SubmitArbitration(stub, args)
	}

	return shim.Error("Invalid invoke function name. Expecting \"invoke\" \"delete\" \"query\"")
}


func (t *SimpleChaincode) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	return shim.Success(nil)
}

// query callback representing the query of a chaincode
func (t *SimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var A string // Entities
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	A = args[0]

	// Get the state from the ledger
	Avalbytes, erro := stub.GetState(A)
	if erro != nil {
		return shim.Error(erro.Error())
	}
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	if Avalbytes == nil {
		jsonResp := "{\"Error\":\"Nil amount for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	jsonResp := "{\"Name\":\"" + A + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success(Avalbytes)
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
