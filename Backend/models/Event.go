package models

type Event struct {
	Listen string     `json:"listen" bson:"listen"`
	Script ScriptInfo `json:"script" bson:"script"`
}

type ScriptInfo struct {
	Exec     []string               `json:"exec" bson:"exec"`
	Type     string                 `json:"type" bson:"type"`
	Packages map[string]interface{} `json:"packages,omitempty" bson:"packages,omitempty"`
}
