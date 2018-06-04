// car
package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode struct {
}

//用户积分
type UserScore struct {
	UserId int `json:"userId"` //用户ID
	NewScore float64 `json:"newDcore"` //用户当前积分
	OldScore float64 `json:"oldDcore"` //用户上步积分
	EventType string `json:"eventType"` //事件类型
	Event string 'json:"json:event"' //事件
}

//车辆积分
type CarScore struct {
	CarId string `json:"carId"` //车牌号
	NewScore float64 `json:"newDcore"` //车辆当前积分
	OldScore float64 `json:"oldDcore"` //车辆上步积分
	EventType string `json:"eventType"` //事件类型
	Event string 'json:"json:event"' //事件
}

//CreateUserScore
func (t *SimpleChaincode) CreateUserScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("CreateUserScore")

	var userId int       //用户ID

	var userScore UserScore
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	userId, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserId ")
	}
	
	userScore.UserId = userId
	userScore.EventType = "0"
	userScore.Event = "用户注册"
	userScore.NewScore = 0
	userScore.OldScore = 0

	jsons, errs := json.Marshal(userScore) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("CreateUserScore success \n")
	return shim.Success(jsons)
}

//ModifyUserScore
func (t *SimpleChaincode) ModifyUserScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("ModifyUserScore")

	var userId int       //用户ID
	var score float64     //变动分值
	var eventType string    //事件类型
	var event string            //事件

	var userScore UserScore
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	userId, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserId ")
	}
	
	score, err = strconv.ParseFloat(args[1], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：Score ")
	}

	eventType = args[2]

	event = args[3]
	
	userByte, erro := stub.GetState(args[0])
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(userByte, &userScore)
	if err != nil {
		return shim.Error(err.Error())
	}

	userScore.UserId = userId
	userScore.EventType = eventType
	userScore.Event = event
	userScore.OldScore = userScore.NewScore
	userScore.NewScore = userScore.NewScore + score

	jsons, errs := json.Marshal(userScore) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("ModifyUserScore success \n")
	return shim.Success(jsons)
}

//GetUserScoreInfo
func (t *SimpleChaincode) GetUserScoreInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("GetUserScoreInfo")

	var userId int       //用户ID
	
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	userId, err = strconv.Atoi(args[0])
	if err != nil {
		return shim.Error("Expecting integer value for asset holding：UserId ")
	}
	
	resultsIterator, err := stub.GetHistoryForKey(userId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	
	fmt.Printf("GetUserScoreInfo success \n")
	return shim.Success(buffer.Bytes())
}

//CreateCarScore
func (t *SimpleChaincode) CreateCarScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("CreateCarScore")

	var carScore CarScore
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	
	carScore.CarId = args[0]
	carScore.EventType = "0"
	carScore.Event = "车辆注册"
	carScore.NewScore = 0
	carScore.OldScore = 0

	jsons, errs := json.Marshal(carScore) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("CreateCarScore success \n")
	return shim.Success(jsons)
}

//ModifyCarScore
func (t *SimpleChaincode) ModifyCarScore(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("ModifyCarScore")

	var carId string       //用户ID
	var score float64     //变动分值
	var eventType string    //事件类型
	var event string            //事件

	var carScore CarScore
	var err error

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	carId = args[0]
	
	score, err = strconv.ParseFloat(args[1], 64)
	if err != nil {
		return shim.Error("Expecting float64 value for asset holding：Score ")
	}

	eventType = args[2]

	event = args[3]
	
	carByte, erro := stub.GetState(args[0])
	if erro != nil {
		return shim.Error(erro.Error())
	}
	//将byte的结果转换成struct
	err = json.Unmarshal(carByte, &carScore)
	if err != nil {
		return shim.Error(err.Error())
	}

	carScore.CarId = carId
	carScore.EventType = eventType
	carScore.Event = event
	carScore.OldScore = carScore.NewScore
	carScore.NewScore = carScore.NewScore + score

	jsons, errs := json.Marshal(carScore) //转换成JSON返回的是byte[]
	if errs != nil {
		return shim.Error(errs.Error())
	}

	// Write the state to the ledger
	err = stub.PutState(args[0], jsons)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("ModifyCarScore success \n")
	return shim.Success(jsons)
}

//GetCarScoreInfo
func (t *SimpleChaincode) GetCarScoreInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("GetCarScoreInfo")

	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	resultsIterator, err := stub.GetHistoryForKey(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	
	fmt.Printf("GetCarScoreInfo success \n")
	return shim.Success(buffer.Bytes())
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
	} else if function == "CreateUserScore" {
		// the old "Query" is now implemtned in invoke
		return t.CreateUserScore(stub, args)
	} else if function == "ModifyUserScore" {
		// the old "Query" is now implemtned in invoke
		return t.ModifyUserScore(stub, args)
	} else if function == "GetUserScoreInfo" {
		// the old "Query" is now implemtned in invoke
		return t.GetUserScoreInfo(stub, args)
	} else if function == "CreateCarScore" {
		// the old "Query" is now implemtned in invoke
		return t.CreateCarScore(stub, args)
	} else if function == "ModifyCarScore" {
		// the old "Query" is now implemtned in invoke
		return t.ModifyCarScore(stub, args)
	} else if function == "GetCarScoreInfo" {
		// the old "Query" is now implemtned in invoke
		return t.GetCarScoreInfo(stub, args)
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
