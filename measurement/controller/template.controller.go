package controller

import (
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/metalpoch/olt-blueprint/common/model"
	"github.com/metalpoch/olt-blueprint/common/pkg/tracking"
	"github.com/metalpoch/olt-blueprint/measurement/usecase"
	"gorm.io/gorm"
)

type templateController struct {
	Usecase usecase.TemplateUsecase
}

func newTemplateController(db *gorm.DB, telegram tracking.SmartModule) *templateController {
	return &templateController{Usecase: *usecase.NewTemplateUsecase(db, telegram)}
}

func AddTemplate(db *gorm.DB, telegram tracking.SmartModule, template *model.AddTemplate) error {
	return newTemplateController(db, telegram).Usecase.Add(template)
}

func UpdateTemplate(db *gorm.DB, telegram tracking.SmartModule, id uint, template *model.AddTemplate) error {
	return newTemplateController(db, telegram).Usecase.Update(id, template)
}

func DeleteTemplate(db *gorm.DB, telegram tracking.SmartModule, id uint) error {
	return newTemplateController(db, telegram).Usecase.Delete(id)
}

func ShowAllTemplates(db *gorm.DB, telegram tracking.SmartModule, csv bool) error {
	templates, err := newTemplateController(db, telegram).Usecase.GetAll()
	if err != nil {
		return err
	}

	t := table.NewWriter()
	t.SetOutputMirror(os.Stdout)
	t.AppendHeader(table.Row{
		"ID",
		"Name",
		"Bandwidth OID",
		"Input OID",
		"Output OID",
		"Created at",
		"Updated at",
	})

	for _, template := range templates {
		t.AppendRow(table.Row{
			template.ID,
			template.Name,
			template.OidBw,
			template.OidIn,
			template.OidOut,
			template.CreatedAt.Local().Format("2006-01-02 15:04:05"),
			template.UpdatedAt.Local().Format("2006-01-02 15:04:05"),
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
