package router

import (
	"github.com/gofiber/fiber/v3"
	"github.com/metalpoch/olt-blueprint/common/pkg/tracking"
	"gorm.io/gorm"
)

func Setup(server *fiber.App, db *gorm.DB, telegram tracking.SmartModule) {
	newTrafficRouter(server, db, telegram)
	newInfoRouter(server, db, telegram)
}
