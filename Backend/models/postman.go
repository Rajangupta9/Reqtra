package models


type PostmanCollection struct {
	Info      PostmanInfo   `json:"info"`
	Items     []PostmanItem `json:"item"`
	Event    []Event       `json:"event"`
	Variables []Variable    `json:"variable"`
}


type PostmanInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}


type PostmanItem struct {
	Name        string        `json:"name"`
	Description string        `json:"description,omitempty"`
	Items       []PostmanItem `json:"item,omitempty"` 
	Request     *Request      `json:"request,omitempty"`
	Event      []Event       `json:"event,omitempty"`
}