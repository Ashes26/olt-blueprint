package snmp

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gosnmp/gosnmp"
	"github.com/metalpoch/olt-blueprint/measurement/internal/constants"
)

type SnmpInfo struct {
	SysName     string
	SysLocation string
}

type Snmp map[int]interface{}

type MapSnmp map[string]Snmp

func GetInfo(ip, community string) (SnmpInfo, error) {
	query := gosnmp.GoSNMP{
		Target:             ip,
		Community:          community,
		Port:               161,
		Transport:          "udp",
		Version:            gosnmp.Version2c,
		Timeout:            time.Duration(2) * time.Second,
		Retries:            0,
		ExponentialTimeout: true,
		MaxOids:            gosnmp.MaxOids,
	}
	err := query.Connect()
	if err != nil {
		return SnmpInfo{}, fmt.Errorf("error on try connect to device: %v", err)
	}
	defer query.Conn.Close()

	result, err := query.Get([]string{constants.SYSNAME_OID, constants.SYSLOCATION_OID})
	if err != nil {
		return SnmpInfo{}, err
	}

	info := SnmpInfo{
		SysName:     string(result.Variables[0].Value.([]byte)),
		SysLocation: string(result.Variables[1].Value.([]byte)),
	}

	return info, nil
}

func Walk(ip, community, oid string) (Snmp, error) {
	result := Snmp{}
	query := gosnmp.GoSNMP{
		Target:             ip,
		Community:          community,
		Port:               161,
		Transport:          "udp",
		Version:            gosnmp.Version2c,
		Timeout:            10 * time.Second,
		Retries:            0,
		ExponentialTimeout: true,
		MaxOids:            gosnmp.MaxOids,
	}
	err := query.Connect()
	if err != nil {
		return nil, fmt.Errorf("error on try connect to device: %v", err)
	}
	defer query.Conn.Close()

	if err = query.BulkWalk(oid, func(pdu gosnmp.SnmpPDU) error {
		parts := strings.Split(pdu.Name, ".")
		strID := parts[len(parts)-1]

		id, err := strconv.Atoi(strID)
		if err != nil {
			return err
		}

		switch pdu.Type {

		case gosnmp.OctetString:
			result[id] = string(pdu.Value.([]byte))

		case gosnmp.Counter32:
			result[id] = int(pdu.Value.(uint))

		case gosnmp.Counter64:
			result[id] = int(pdu.Value.(uint64))

		case gosnmp.Gauge32:
			result[id] = int(pdu.Value.(uint))

		case gosnmp.Uinteger32:
			result[id] = int(pdu.Value.(uint))
		default:
			return errors.New("invalid snmp response type")
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return result, err
}
