package proxyServices

import (
	"fmt"
	requestmodel "reqtra/models/requestModel"

	"github.com/dop251/goja"
)


type Sandbox struct {
	vm          *goja.Runtime
	Environment map[string]string
	Response    *requestmodel.ResponseInfo 
	Tests       []requestmodel.TestResult
}


func NewSandbox() *Sandbox {
	vm := goja.New()
	sbox := &Sandbox{
		vm:          vm,
		Environment: make(map[string]string),
		Tests:       []requestmodel.TestResult{},
	}


	vm.Set("pm", sbox)
	sbox.registerFunctions()
	return sbox
}


func (s *Sandbox) registerFunctions() {
	s.vm.RunString(`
        pm.environment = {
            get: function(key) { return pm.getEnv(key); },
            set: function(key, value) { pm.setEnv(key, value); }
        };
        pm.test = function(testName, callback) {
            pm.runTest(testName, callback);
        };
        pm.response = {}; // Initially an empty object
    `)
}


func (s *Sandbox) SetEnv(key string, value string) {
	s.Environment[key] = value
}


func (s *Sandbox) GetEnv(key string) string {
	return s.Environment[key]
}


func (s *Sandbox) RunTest(name string, callback goja.Callable) {
	result := requestmodel.TestResult{Name: name}
	defer func() {
		if r := recover(); r != nil {
			result.Passed = false
			result.Error = fmt.Sprintf("%v", r)
			s.Tests = append(s.Tests, result)
		}
	}()

	_, err := callback(goja.Undefined())
	if err != nil {
		result.Passed = false
		result.Error = err.Error()
	} else {
		result.Passed = true
	}
	s.Tests = append(s.Tests, result)
}

func (s *Sandbox) PopulateResponseData(responseInfo *requestmodel.ResponseInfo) {
	s.Response = responseInfo
	s.vm.Set("pm", s)
	s.vm.RunString(`
        pm.response.json = function() {
            try { return JSON.parse(pm.response.body); } catch (e) { return null; }
        };
    `)
}


func (s *Sandbox) Run(script string) error {
	if script == "" {
		return nil
	}
	_, err := s.vm.RunString(script)
	return err
}
