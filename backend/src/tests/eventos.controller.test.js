
import EventosController from "../domains/Asistencia/api/controllers/eventos.controller.js";


describe("EventosController", () => {
    let mockUseCase;
    let eventosController;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockUseCase = {
            ejecutar: jest.fn()
        };
        eventosController = new EventosController(mockUseCase);
        mockRes = {
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    it("should return a list of events", async () => {
        const mockEventos = [{ id: 1, nombre: "Evento 1" }];
        mockUseCase.ejecutar.mockResolvedValue(mockEventos);

        await eventosController.obtenerListaEventos({}, mockRes, mockNext);

        expect(mockUseCase.ejecutar).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(mockEventos);
    });

    it("should throw an error if use case fails", async () => {
        const error = new Error("Error interno");
        mockUseCase.ejecutar.mockRejectedValue(error);

        await expect(eventosController.obtenerListaEventos({}, mockRes, mockNext))
            .rejects
            .toThrow("Error interno");
    });
});
