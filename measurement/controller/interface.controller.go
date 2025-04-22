package controller

import (
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/metalpoch/olt-blueprint/common/constants"
	"github.com/metalpoch/olt-blueprint/common/pkg/tracking"
	"github.com/metalpoch/olt-blueprint/common/usecase"
	"gorm.io/gorm"
)

type interfaceController struct {
	Usecase usecase.InterfaceUsecase
}

func newInterfaceController(db *gorm.DB, telegram tracking.SmartModule) *interfaceController {
	return &interfaceController{*usecase.NewInterfaceUsecase(db, telegram)}
}

func ShowAllInterfaces(db *gorm.DB, telegram tracking.SmartModule, deviceID uint, csv bool) error {
	interfaces, err := newInterfaceController(db, telegram).Usecase.GetAllByDevice(deviceID)
	if err != nil {
		return err
	}

	t := table.NewWriter()
	t.SetOutputMirror(os.Stdout)
	t.AppendHeader(table.Row{
		"ID",
		"IfIndex",
		"IfName",
		"IfDescr",
		"IfAlias",
		"Created at",
		"Updated at",
	})

	for _, i := range interfaces {
		t.AppendRow(table.Row{
			i.ID,
			i.IfIndex,
			i.IfName,
			i.IfDescr,
			i.IfAlias,
			i.CreatedAt.Local().Format(constants.FORMAT_DATE),
			i.UpdatedAt.Local().Format(constants.FORMAT_DATE),
		})
		t.AppendSeparator()
	}
	if csv {
		t.RenderCSV()
	} else {
		t.Render()
	}

	return nil
}
