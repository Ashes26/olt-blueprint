package router

import (
	"github.com/gofiber/fiber/v3"
	"github.com/metalpoch/olt-blueprint/common/pkg/tracking"
	"github.com/metalpoch/olt-blueprint/core/handler"
	"github.com/metalpoch/olt-blueprint/core/usecase"
	"gorm.io/gorm"
)

func newTrafficRouter(server *fiber.App, db *gorm.DB, telegram tracking.SmartModule) {
	hdlr := handler.TrafficHandler{
		Usecase: *usecase.NewTrafficUsecase(db, telegram),
	}

	server.Get("/traffic/interface/:id", hdlr.GetByInterface)
	server.Get("/traffic/device/:id", hdlr.GetByDevice)
	server.Get("/traffic/fat/:id", hdlr.GetByFat)
	server.Get("/traffic/location/:state", hdlr.GetByState)
	server.Get("/traffic/location/:state/:county", hdlr.GetByCounty)
	server.Get("/traffic/location/:state/:county/:municipality", hdlr.GetByMunicipaly)
	server.Get("/traffic/odn/:odn", hdlr.GetTrafficByODN)
}
