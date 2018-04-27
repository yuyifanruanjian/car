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
	Name       string   `json:"name"`        //用户名称
	Passwd     string   `json:"passwd"`      //密码
	PhonNumber string   `json:"phoneNumber"` //电话号码
	Score      float64  `json:"score"`       //信用分值
	CarID      []string `json:"carId"`       //车牌号
	PhotoID    []int    `json:"photoId"`     //提交图片ID
	QuestionID []int    `json:"questionId"`  //提出问题ID
	BookID     []int    `json:"bookId"`      //教程ID
	ID         int      `json:"id"`          //用户ID
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
	Answers   []Answer       `json:"answers"`   //回复列表
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


var PhotoList map[int]Photo

var BookList map[int]Book

var QuestionList map[int]Question

var AnswerList map[int][]Answer

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
	
	question.Answers = append(question.Answers, answer)
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



func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
